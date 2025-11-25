# SPARQL in the Dark ✨🌘
#### Patterns for Exploring Uncharted DH Knowledge Graphs

## Introduction
*SPARQL in the Dark* is a collection of practical SPARQL patterns and strategies for exploring *unknown* Knowledge Graphs.

The patterns presented here treat SPARQL as a discovery tool for incrementally (and often *maieutically*) revealing Knowledge Graph structure, entities, relationships, and modelling conventions - i.e. the data shapes manifested in a given graph.

This repository provides reusable SPARQL query templates, methodological notes, as well as examples and query strategies drawn from Digital Humanities datasets, but the patterns generalize to any unfamiliar RDF graph

## Query Patterns

### Preface
Before applying any of the patterns in this section, it is important to acknowledge two factors that significantly influence how SPARQL queries behave in practice - especially when aiming for generalized, triplestore-agnostic exploration.

#### 1. Default-graph semantics (union vs. non-union).

SPARQL queries are executed against an RDF Dataset which represents a collection of graphs; i.e. a single unnamed graph (the default graph) and zero or more named graphs (see [SPARQL 1.2, 13. RDF Datasets](https://www.w3.org/TR/sparql12-query/#rdfDataset)).

Different triple stores handle the default graph in different ways. Particularly, some expose the default graph as the union of the default graph and all named graphs; others do not.

For truly generalizable patterns, one must assume non-union semantics and explicitly unify all graphs in every query where completeness matters. For example:

```sparql
select *
where {
  {?s ?p ?o .}
  union
  {
	graph ?g {
	  ?s ?p ?o .
	}
  }
}
```

> Note that, for convenience and readability, the patterns in this repository do not include explicit UNION constructions and ergo target the default graph (however it might be constituted).


A simple method for probing a triple store’s default-graph semantics is to count the triples stored in the default graph and compare them to the triple count of the union of all named graphs:

```sparql
select
	?default_graph_count
	?named_graphs_count
	((?default_graph_count + ?named_graphs_count) as ?sum_count)
where {
  {
	select (count(?s) as ?default_graph_count)
	where { ?s ?p ?o }
  }
  {
	select (count(?s) as ?named_graphs_count)
	where { graph ?g { ?s ?p ?o } }
  }
}
```

If `named_graphs_count` is greater than zero and `default_graph_count` equals `sum_count`, this is consistent with a triplestore configuration in which the default graph is defined as the union of all named graphs.

An alternative approach to investigating default graph semantics is to `ASK` whether there are any triples in the default graph that are *not* also in any named graph:

```sparql
ask {
  graph ?g {
	?s ?p ?o
  }
  filter not exists {
	?s ?p ?o
  }
```

#### 2. Reasoning and entailment regimes.

If a targeted triplestore performs reasoning, queries run against both asserted and inferred triples, potentially yielding results that differ significantly from querying only the asserted graph.

Some patterns may yield richer results (due to inferred types, properties, and class hierarchies), while others may become noisier or misleading depending on the entailment regime (see e.g. [OWL Profiles](https://www.w3.org/TR/owl2-profiles/)).

Because inferencing varies widely across triple stores, the patterns in this repository assume no reasoning unless explicitly stated, and note where reasoning would meaningfully alter the behavior or usefulness of a given pattern.


### Classes

Classes play a central role in RDF knowledge graphs by providing conceptual categories for entities, enabling semantic typing and grouping of resources.
Querying for classes is therefore a key exploratory step in gaining insight to an unknown RDF graph, as it reveals the domain vocabulary and implicit modeling assumptions that shape how knowledge is represented in the graph.

Classes in RDF are *explicitely* defined by asserting instances of `rdfs:Class` or `owl:Class` where `owl:Class` is a subclass of `rdfs:Class`.
So asking for the union of all asserted `rdfs:Class`/`owl:Class` relations in the graph will retrieve all materialized class declarations.

What class declarations are actually materialized also depends on inferencing and the axioms accessible to a reasoner.

For example, certain OWL constructs are usually expressed using blank nodes and a reasoner will often materialize class definitions for those nodes (e.g. because of inference rules like domain/range or type assertions in the OWL rule definitions, etc.);
it might therefore be desirable to exclude blank node class assertions from a result set, as they are mostly of interest to a reasoner.

> Note that the applied deductive closure (see [OWL Profiles](https://www.w3.org/TR/owl2-profiles/)) is an important factor in SPARQL query design.

> Note that many explorative queries will traverse the entire knowledge graph, so depending on the size of the graph, this can be a computionally expensive operation.

So a query for retrieving all explicitely defined classes (including inferred class assertions) could look like this:

```sparql
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?class
where {
	values ?class_type {
		rdfs:Class owl:Class
	}
	?class a ?class_type .

	# OWL axioms are often defined using blank nodes
	# those classes are mostly of interest to a reasoner
	filter (!isBLANK(?class))
}
```

> Note that, if a reasoner with any *OWL* closure is running, than asking for `owl:Class` is superfluous.

> Note that the above query could also be written with a UNION of all `rdfs:Class` and `owl:Class` instances.


It is good ontology engineering practice to document entities with `rdfs:label` and/or `rdfs:comment`,
so for exploring classes of an unknown Knowledge Graph it can be insightful to also query for class documention.

The following query extends the above pattern with OPTIONAL inquiries for comments and labels (including a language filter):

```sparq
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?class ?label ?comment
where {
	values ?class_type {
		rdfs:Class owl:Class
	}
	?class a ?class_type .

	optional {
		?class rdfs:label ?label
	}
	optional {
		?class rdfs:comment ?comment
		filter (lang(?comment) = "en" || lang(?comment) = "")
	  }

	filter (!isBLANK(?class))
}
```

Classes may also be defined implicitely by subclass definitions (the domain of `rdfs:subClassOf` is `rdfs:Class`).
An RDFS reasoner will ergo infer that subclasses are classes, so the above query will find subclass-implied classes.

However, if no reasoner at all is running, one can still find subclass-defined classes with a simple property path expression:

```sparql
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?class
where {
	?class rdfs:subClassOf+ ?super_class .
}
```

Another useful pattern for exploring an unknown graph is to query for actual class *usage*.
The following snippet retrieves all classes that have instances and orders classes by the count of instances.

```sparql
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?class (count(?instance) as ?instance_count)
where {
	?instance a ?class
}
group by ?class
order by desc(?instance_count)
```

### Predicates

Predicates constitute the *relational vocabulary* of an RDF knowledge graph, specifying how resources are connected within a graph and which properties they may have.
Exploring predicates via SPARQL can therefore be a powerful means of understanding the semantic structure of a given RDF graph, as predicates reveal both the available relations and the modeling granularity adopted by the data producers.


The following query aims to retrieve all properties from a graph;
however, it depends on an active reasoner with an OWL closure and RDFS and OWL ontologies definitions being fully loaded.

```sparql
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?p
where {
	?ptype rdfs:subClassOf+ rdf:Property .
	?p a ?ptype
}
```

A more general approach is to explicitely search for instances of the common property classes (`rdfs:Property`, `owl:ObjectProperty`, `owl:DatatypeProperty`);
the query below does exactly that by utilizing a VALUES clause:

```sparql
prefix owl: <http://www.w3.org/2002/07/owl#>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?p
where {
	values ?ptype {
		rdf:Property
		owl:ObjectProperty
		owl:DatatypeProperty
		# owl:AnnotationProperty
		# owl:OntologyProperty
	}
	?p a ?ptype
}
```

Much the same as with the query patterns for retrieving classes, one can also search for property frequency in the graph:

```sparql
prefix owl: <http://www.w3.org/2002/07/owl#>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select ?p (count(?p) as ?cnt)
where {
	?s ?p ?o .
}
group by ?p
order by desc(?cnt)
```

Another simple yet often particularly insightful exploration technique is to query for a particular predicate or set of predicats.

E.g. the following query template uses a place holder `<predicate>` that is meant to reference any predicate;
the resulting query will compute a simple occurrence count of the provided predicate in a given graph.


```sparql
prefx rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select ?p (count(?p) as ?cnt)
where {
	bind (<predicate> as ?p)
	?s ?p ?o
}
group by ?p
order by desc(?cnt)
```

### Ontologies and Namespaces

Ontologies define the conceptual framework of a knowledge graph, specifying the classes, relationships, and constraints that structure the data.
Querying ontologies via SPARQL helps explorers to understand the intended meaning and organization of the graph’s content.

Before querying ontologies, querying *about* ontologies can be valuable means of gaining an overiew.

It is good practice to assert information about an ontology in an *Ontology Header* (see [OWL Web Ontology Language, 7.2. Ontology header](https://www.w3.org/TR/owl-ref/#Ontology-def)).

To check which ontologies are currently loaded one might ergo simply query for all defined `owl:Ontology` instances:

```sparql
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?ontology
where {
	?ontology a owl:Ontology .
}
```

Apart from potential problems and ambiguities in ontology header name resolution (see e.g. [Protégé, Names of Ontologies](https://protegewiki.stanford.edu/wiki/How_Owl_Imports_Work#Names_of_Ontologies)),
some ontologies simply might not define ontology headers at all.

A heuristic for finding ontology namespaces for ontologies that are not fully loaded or do not define ontology headers, could be to query for every namespace that defines a class or a property:

```sparql
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?ontology where {
  values ?type {
	rdf:Class
	owl:Class
	rdf:Property
	owl:ObjectProperty
	owl:DatatypeProperty
  }

  ?term a ?type .
  filter (isIRI(?term))

  # Extract namespace
  bind (
	 iri(replace(str(?term), "([#/][^#/]+)$", ""))
	 as ?ontology
  )
}
```


## Query Strategies
[todo]
