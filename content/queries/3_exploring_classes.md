# Classes and Entities

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
## Instances of Instantiation
The central idea of this query is to look for and match the instantiation of class entities.
In RDF, an instance of a class is declared by asserting `rdf:type` about a resource. The highlighted triple pattern looks for such instances of instantiation.


Note that `a` is synonymous with `rdf:type` in the predicate position.

---
<!-- highlight: 6-8 -->
## Types of Types
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
## Entity Identity
When exploring a graph for classes as conceptual categories, it is generally desirable to focus on class definitions that have global identifiers, i.e. IRIs.

Blank node class definitions are usually materialized by an inferencer and are mostly of interest to reasoning engines.

The FILTER clause therefore includes only results that are not blank nodes. See `isBLANK` or `isIRI` in the [Functions on RDF Terms](https://www.w3.org/TR/sparql12-query/#func-rdfTerms) section of the SPARQL 1.2 specification.

---
<!-- highlight: 4 -->

## One of a Kind
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
## Looking for Labels
The OPTIONAL clause simply looks for `rdfs:label` assertions about the matched `?class`.
If the query engine is unable to find a label assertion, `?label` will be unbound.

---
<!-- highlight: 14-17 -->
## Querying for Comments
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
## OneOrMorePath

The pattern uses a SPARQL Property Path expression to match 1 to n (arbitrary length) RDF paths along `rdfs:subClassOf` and ergo matches any `?class` that is a direct or indirect subclass of `?super_class`.

See [Property Paths](https://www.w3.org/TR/sparql12-query/#propertypaths) in the SPARQL 1.2 reference.


===

Another useful pattern for exploring an unknown graph is to query for actual class usage. The following snippet retrieves all classes that have instances and orders classes by the count of instances.


```sparql playground=dbpedia_dump
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
## Grouping and Aggregation

Grouping and aggregation are fundamental data processing operations that partition a dataset into subsets based on shared attributes and compute summary values over each subset.

In the case at hand, the data is first partitioned according to the `?class` binding and then the COUNT aggregation function is applied to each group counting `?instance` occurences.

---
<!-- highlight: 7 -->
The ORDER BY solution modifier orders the results according to the referenced binding and an optional order modifier (either ASC or DESC).

See [ORDER BY](https://www.w3.org/TR/sparql12-query/#modOrderBy) in the SPARQL 1.2 reference.
