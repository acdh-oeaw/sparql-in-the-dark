# SPARQL in the Dark ✨🌘

**Patterns for Exploring Uncharted DH Knowledge Graphs**

## Introduction
*SPARQL in the Dark* is a collection of practical SPARQL patterns and strategies for exploring unknown Knowledge Graphs.

The patterns presented here treat SPARQL as a discovery tool for incrementally (and often *maieutically*) revealing Knowledge Graph structure, entities, relationships, and modelling conventions - i.e. the data shapes manifested in a given graph.

This repository provides reusable SPARQL query templates, methodological notes, as well as examples and query strategies drawn from Digital Humanities datasets, but the patterns generalize to any unfamiliar RDF graph
## Table of Contents

- [Introduction to SPARQL Queries](#introduction-to-sparql-queries)
- [Preface](#preface)
- [Classes and Entities](#classes-and-entities)
- [Predicates and Relations](#predicates-and-relations)
- [Ontologies and Namespaces](#ontologies-and-namespaces)

## Introduction to SPARQL Queries
Welcome! This lesson will guide you through the fundamental structure of a SPARQL query. Scroll down to begin and see how queries are built, piece by piece.

```sparql
## Find all countries and their capitals

PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

SELECT ?countryLabel ?capitalLabel
WHERE {
  ?country wdt:P31 wd:Q6256;
           wdt:P36 ?capital.

  # Get labels for cleaner results
  ?country rdfs:label ?countryLabel.
  ?capital rdfs:label ?capitalLabel.

  FILTER(LANG(?countryLabel) = "en")
  FILTER(LANG(?capitalLabel) = "en")
}
LIMIT 10
```

---

### Introduction
This is our very first SPARQL query. Let's take a closer look!

---
<!-- highlight: 3-4 -->
### The `PREFIX` Declaration
Prefixes are shortcuts. They let us abbreviate long URIs to make our queries cleaner and more readable.

Here, `wd:` stands for a Wikidata entity and `wdt:` for a Wikidata property. Think of them as nicknames for web addresses.

---
<!-- highlight: 6 -->
### The `SELECT` Clause
The `SELECT` clause specifies which variables you want to see in your results.

A variable in SPARQL starts with a `?`. In this case, we are asking for the labels of the country and its capital.

---
<!-- highlight: 7, 17 -->
### The `WHERE` Clause
This is the heart of the query. The `WHERE` clause contains the graph patterns that are matched against the data.

Everything inside the curly braces `{}` defines the shape of the data we're looking for.

---
<!-- highlight: 8-9 -->
### Triple Patterns
Inside `WHERE`, we define **triple patterns**: `subject predicate object`.

The first pattern finds any `?country` that is an "instance of" (`wdt:P31`) a "country" (`wd:Q6256`) and has a "capital" (`wdt:P36`) called `?capital`.

---
<!-- highlight: 12-13 -->
### Getting Labels
Wikidata entities are stored as IDs (like `Q6256`). To get human-readable names, we look for the \`rdfs:label\` property.

Here, we fetch the English label for both the country and the capital.

---
<!-- highlight: 15-16 -->
### Filtering Results
We use the `FILTER` clause to refine our results.

In this case, we ensure we only get labels that are in English (`"en"`) by checking the language tag of the variables.

---
<!-- highlight: 18-18 -->
### Limiting Results
Finally, `LIMIT` restricts the number of results returned.

This is especially useful when testing queries on large datasets like Wikidata to avoid long waiting times.


## Preface
Before applying any of the patterns in this section, it is important to acknowledge two factors that significantly influence how SPARQL queries behave in practice - especially when aiming for generalized, triplestore-agnostic exploration.

### 1. Default-graph semantics

SPARQL queries are executed against an RDF Dataset which represents a collection of graphs; i.e. a single unnamed graph (the default graph) and zero or more named graphs (see [SPARQL 1.2, 13. RDF Datasets](https://www.w3.org/TR/sparql12-query/#rdfDataset)).


Different triple stores handle the default graph in different ways. Particularly, some expose the default graph as the union of the default graph and all named graphs; others do not.


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

An alternative approach to investigating default graph semantics is to `ASK` whether there are any triples in the default graph that aren't also in any named graph:

```sparql
ask {
  graph ?g {
	?s ?p ?o
  }
  filter not exists {
	?s ?p ?o
  }
}
```


### 2. Reasoning and entailment regimes

If a targeted triplestore performs reasoning, queries run against both asserted and inferred triples, potentially yielding results that differ significantly from querying only the asserted graph.

Some patterns may yield richer results (due to inferred types, properties, and class hierarchies), while others may become noisier or misleading depending on the entailment regime (see e.g. [OWL Profiles](https://www.w3.org/TR/owl2-profiles/)).

Because inferencing varies widely across triple stores, the patterns in this repository assume no reasoning unless explicitly stated, and note where reasoning would meaningfully alter the behavior or usefulness of a given pattern.


## Classes and Entities

The section provides SPARQL patterns and general considerations for exploring classes and entities of an unknown or only partially known RDF graph.

Classes play a central role in RDF knowledge graphs by providing conceptual categories for entities, enabling semantic typing and grouping of resources.
Querying for classes is therefore a key exploratory step in gaining insight to an unknown RDF graph,
as it reveals the domain vocabulary and implicit modeling assumptions that shape how knowledge is represented in the graph.

Classes in RDF are explicitely defined by asserting instances of `rdfs:Class` or `owl:Class` where `owl:Class` is a subclass of `rdfs:Class`.
So asking for the union of all asserted `rdfs:Class`/`owl:Class` relations in the graph will retrieve all materialized class declarations.

What class declarations are actually materialized also depends on inferencing and the axioms accessible to a reasoner.

For example, certain OWL constructs are usually expressed using blank nodes and a reasoner will often materialize class definitions for those nodes
(e.g. because of inference rules like domain/range or type assertions in the OWL rule definitions, etc.);
it might therefore be desirable to exclude blank node class assertions from a result set, as they are mostly of interest to a reasoner.

A query for retrieving all explicitely defined classes (including inferred class assertions) could therefore look like this:

```sparql
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?class
where {
	values ?class_type {
		rdfs:Class owl:Class
	}

	?class a ?class_type .
	filter (!isBLANK(?class))
}
```
---
<!-- highlight: 10 -->
### Instances of Instantiation
The central idea of this query is to look for and match the instantiation of class entities.
In RDF, an instance of a class is declared by asserting `rdf:type` about a resource. The highlighted triple pattern looks for such instances of instantiation.


Note that `a` is synonymous with `rdf:type` in the predicate position.

---
<!-- highlight: 6-8 -->
### Types of Types
As mentioned, classes in RDF are defined by asserting instances of `rdfs:Class` or `owl:Class` where `owl:Class` is a subclass of `rdfs:Class`.

The VALUES clause binds `?class_type` to `rdfs:Class` and `owl:Class`, which is then used in the simple triple matching pattern below.

For static inline data in SPARQL see [VALUES: Providing inline data](https://www.w3.org/TR/sparql12-query/#inline-data) in the SPARQL 1.2 specification.

> The goal of the query is to find the union of all asserted `rdfs:Class`/`owl:Class` relations in a given graph. Instead of the VALUES clause, it's also possible to query for a graph pattern UNION.

```sparql
select distinct ?class
where {
	{ ?class a rdfs:Class . }
	union
	{ ?class a owl:Class . }
}
```

> Note that, since `owl:Class` is a subclass of `rdfs:Class`, a reasoner would infer any instance of `owl:Class` to also be an instance of `rdfs:Class`. In that case, it would be superfluous to explicitely query for instances of `owl:Class`.

---
<!-- highlight: 11 -->
### Entity Identity
When exploring a graph for classes as conceptual categories, it is generally desirable to focus on class definitions that have global identifiers, i.e. IRIs.

Blank node class definitions are usually materialized by an inferencer and are mostly of interest to reasoning engines.

The FILTER clause therefore includes only results that are not blank nodes. See `isBLANK` or `isIRI` in the [Functions on RDF Terms](https://www.w3.org/TR/sparql12-query/#func-rdfTerms) section of the SPARQL 1.2 specification.

---
<!-- highlight: 4 -->

### One of a Kind
The RDF data model supports multi-typing, so e.g. it might well be possible for an entity to be both of type `rdfs:Class` **and** `owl:Class`.

In order to avoid duplicate results for such cases, only DISTINCT results should be collected in our query's SELECT clause.


===

It is good ontology engineering practice to document entities with `rdfs:label` and `rdfs:comment`, so for exploring classes of an unknown knowledge graph it can be insightful to also query for class documention.

The following query extends the above pattern with OPTIONAL inquiries for comments and labels (including a language filter)

```sparql
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

---
<!-- highlight: 11-13 -->
### Looking for Labels
The OPTIONAL clause simply looks for `rdfs:label` assertions about the matched `?class`.
If the query engine is unable to find a label assertion, `?label` will be unbound.

---
<!-- highlight: 14-17 -->
### Querying for Comments
Much like the pattern for finding `rdfs:label`, this OPTIONAL clause looks for `rdfs:comment` assertions and also adds a FILTER for narrowing the result to english or untagged comment literals.


===

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

---
<!-- highlight: 5 -->
### OneOrMorePath

The pattern uses a SPARQL Property Path expression to match 1 to n (arbitrary length) RDF paths along `rdfs:subClassOf` and ergo matches any `?class` that is a direct or indirect subclass of `?super_class`.

See [Property Paths](https://www.w3.org/TR/sparql12-query/#propertypaths) in the SPARQL 1.2 reference.


===

Another useful pattern for exploring an unknown graph is to query for actual class usage. The following snippet retrieves all classes that have instances and orders classes by the count of instances.


```sparql
select distinct ?class (count(?instance) as ?instance_count)
where {
	?instance a ?class
	filter (isIRI(?class))
}
group by ?class
order by desc(?instance_count)
```

---
<!-- highlight: 3-4 -->
Similar to the above query for finding all explicitely defined classes, the main pattern here aims to find instances with global indentifieres.

---
<!-- highlight: 1, 6 -->
### Grouping and Aggregation

Grouping and aggregation are fundamental data processing operations that partition a dataset into subsets based on shared attributes and compute summary values over each subset.

In the case at hand, the data is first partitioned according to the `?class` binding and then the COUNT aggregation function is applied to each group counting `?instance` occurences.

---
<!-- highlight: 7 -->
The ORDER BY solution modifier orders the results according to the referenced binding and an optional order modifier (either ASC or DESC).

See [ORDER BY](https://www.w3.org/TR/sparql12-query/#modOrderBy) in the SPARQL 1.2 reference.


## Predicates and Relations

The section provides SPARQL patterns and general considerations for exploring predicates and entity relations of an unknown or only partially known RDF graph.

Predicates constitute the *relational vocabulary* of an RDF knowledge graph, specifying how resources are connected within a graph and which properties they may have.
Exploring predicates via SPARQL can therefore be a powerful means of understanding the semantic structure of a given RDF graph, as predicates reveal both the available relations and the modeling granularity adopted by the data producers.


In order to get an overview over the relations in a graph, a good first step is to obtain the predicate vocabulary.

The following query aims to retrieve all property definitions from a graph; note however, that it depends on an active reasoner with an OWL closure and RDFS and OWL ontologies definitions being fully loaded.

```sparql
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select distinct ?p
where {
	?p a [rdfs:subClassOf* rdf:Property] .
}
```

---
<!-- highlight: 4 -->

### One of a Kind
Predicates are defined by asserting instances of `rdfs:Property`, `owl:ObjectProperty` or `owl:DatatypeProperty`.

Given the multi-typing support of the RDF data model, it is well possible for a predicate to be both of type e.g. `rdfs:Property`, `owl:ObjectProperty`.

Same as for the queries aiming to find explicitely defined classes in a graph, only DISTINCT results should be collected in our query's SELECT clause.


---
<!-- highlight: 6 -->
### ZeroOrMorePath

The pattern uses a SPARQL Property Path expression to match 0 to n RDF paths along `rdfs:subClassOf` to find all `rdf:Property` assertions.

Note that a `ZeroOrMorePath` closure is required here in order to also match `rdf:Property` itself, not just its subclasses.

See [Property Paths](https://www.w3.org/TR/sparql12-query/#propertypaths) in the SPARQL 1.2 reference.

Also note the use of a SPARQL blank node expression in the triple pattern object position. A blank node expression in a SPARQL triple pattern is interpreted as an unnamed binding. See the [Syntax for Blank Nodes](https://www.w3.org/TR/sparql12-query/#QSynBlankNodes) section in the SPARQL 1.2 specification.


===


A more general approach for obtaining the defined predicate vocabulary is to explicitely search for instances of the common property classes (`rdfs:Property`, `owl:ObjectProperty`, `owl:DatatypeProperty`); the query below does exactly that by utilizing a VALUES clause.

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
---
<!-- highlight: 8-12 -->
### Predicate Classes
As mentioned, predicates are usually defined by asserting instances of `rdfs:Property`, `owl:ObjectProperty` or `owl:DatatypeProperty`.

> `owl:AnnotationProperty` and `owl:OntologyProperty` are property classes for ontology metadata predicates and are less frequently used.

The VALUES clause binds `?ptype` to the specified property class IRIs.

For static inline data in SPARQL see [VALUES: Providing inline data](https://www.w3.org/TR/sparql12-query/#inline-data) in the SPARQL 1.2 specification.

---
<!-- highlight: 14 -->
The simple triple pattern finds predicate definitions in a graph by matching instances of the predicate classes bound by the VALUES clause.

===

Much the same as with the query patterns for retrieving classes, one can also search for property frequency in the graph:

```sparql
select ?p (count(?p) as ?cnt)
where {
	?s ?p ?o .
}
group by ?p
order by desc(?cnt)
```

---
<!-- highlight: 3-->
### All the Things

The triple pattern with 3 variables matches every triple in the graph.

Note: Obviously, matching every triple in an RDF dataset can be a computionally expensive operation for large graphs.

Another note: Since we are only really interested in `?p`, another way to write the query pattern using blank node expressions would be `[?p []]`.

Again, see [Syntax for Blank Nodes](https://www.w3.org/TR/sparql12-query/#QSynBlankNodes).

---
<!-- highlight: 1, 5-->
### Grouping and Aggregation

Grouping and aggregation are fundamental data processing operations that partition a dataset into subsets based on shared attributes and compute summary values over each subset.

Here, the data is first partitioned according to the `?p` binding and then the COUNT aggregation function is applied to the group itself which effectively counts the number of solutions in that group.


---
<!-- highlight: 6 -->
The ORDER BY solution modifier orders the results according to the referenced binding and an optional order modifier (either ASC or DESC).

See [ORDER BY](https://www.w3.org/TR/sparql12-query/#modOrderBy) in the SPARQL 1.2 reference.

===

Another simple yet often particularly insightful exploration technique is to query for a particular predicate or set of predicats.

The following query template uses a place holder `<predicate>` that is meant to reference any predicate; the resulting query will compute a simple occurrence count of the provided predicate in a given graph.

```sparql
select ?p (count(?p) as ?cnt)
where {
	bind (<predicate> as ?p)
	?s ?p ?o
}
group by ?p
order by desc(?cnt)
```

---
<!-- highlight: 1, 4, 6-7 -->
### Same Old
The query is essentially a simple derivation of the Grouping and Aggregation example above. It partitions the entire graph according to `?p` and counts the solutions per group.

---
<!-- highlight: 3 -->
### Finding the Binding
The BIND expression defines a binding for `?p` and can be used to find the occurrence count of a predicate type `?p` in the graph.

E.g. one could find the number of type assertions by using `bind (rdf:type as ?p)`.

Note that for finding multiple predicate counts, either multiple BIND expressions or a VALUES clause can be used.


## Ontologies and Namespaces

The section provides SPARQL patterns and general considerations for exploring ontology and namespace definitions of an unknown or only partially known RDF graph.

Ontologies define the conceptual framework of a knowledge graph, specifying the classes, relationships, and constraints that structure the data.
Querying ontologies via SPARQL helps explorers to understand the intended meaning and organization of the graph’s content.

Before querying ontologies, querying **about** ontologies can be valuable means of gaining an overiew.

It is good ontology engineering practice to assert information about an ontology in an Ontology Header. See the [Ontology header](https://www.w3.org/TR/owl-ref/#Ontology-def) section of the OWL Reference.
To check which ontologies are currently loaded one might ergo simply query for all defined `owl:Ontology` instances.

```sparql
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?ontology
where {
	?ontology a owl:Ontology .
}
```

===

Apart from potential problems and ambiguities in ontology header name resolution (see e.g. [Protégé, Names of Ontologies](https://protegewiki.stanford.edu/wiki/How_Owl_Imports_Work#Names_of_Ontologies)), some ontologies simply might not define ontology headers at all.

A heuristic for finding ontology namespaces for ontologies that are not fully loaded or do not define ontology headers, could be to query for every namespace that defines a class or a property.

```sparql
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix owl: <http://www.w3.org/2002/07/owl#>

select distinct ?namespace where {
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
	 as ?namespace
  )
}
```

---
<!-- highlight: 6-10 -->
### Types of Types
The query generally aims to look for all entity-type-defining assertions.

Entity types in RDF are explicitely defined by asserting instances of a class or property, so the VALUES clause binds class and property types.

---
<!-- highlight: 13-14 -->
### Entity Identity
The simple triple pattern matches instances of the class and property types specified in the VALUES clause.


Type instances referenced by blank nodes are usually inferred and only of interest to reasoners, so those are FILTERed out.

---
<!-- highlight: 18 -->
### Regex Replace
The idea of this line in the query is to extract just the namespace from an entity IRI, i.e. to remove the entity name from the IRI.

In order to achieve this, the entity-defining `?term` is STR-cast and passed to the REPLACE function. 
The signature of REPLACE defines *argument*, *pattern* and *replacement* as parameters; 
the function matches the *pattern* against *argument* and replaces the match with *replacement*. See [REPLACE](https://www.w3.org/TR/sparql12-query/#func-replace) in the SPARQL 1.2 reference.

The regular expression here matches any character that is not "#" or "/" after the last "#" or "/" in the target string, essentially matching the last part (the entity name) in a fragment- or segment-delimited IRI.

The REPLACE function then replaces the pattern match with the empty string, effectively removing the entity name from the targeted IRI.

---
<!-- highlight: 17-20 -->
### Safe and Bound
The BIND expression in SPARQL establishes a variable bound to a value. In this case, the result of the REPLACE function is IRI-cast and bound to `?namespace`.

See [BIND](https://www.w3.org/TR/sparql12-query/#bind) in the SPARQL 1.2 reference.

---
<!-- highlight: 4 -->
### One of a Kind
RDF supports multi-typing, so in order to avoid duplicate values in the result, only DISTINCT values should be collected in queries asking for entity types.


