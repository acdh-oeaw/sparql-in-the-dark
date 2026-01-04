# Predicates and Relations

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

## One of a Kind
Predicates are defined by asserting instances of `rdfs:Property`, `owl:ObjectProperty` or `owl:DatatypeProperty`.

Given the multi-typing support of the RDF data model, it is well possible for a predicate to be both of type e.g. `rdfs:Property`, `owl:ObjectProperty`.

Same as for the queries aiming to find explicitely defined classes in a graph, only DISTINCT results should be collected in our query's SELECT clause.


---
<!-- highlight: 6 -->
## ZeroOrMorePath

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
## Predicate Classes
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
## All the Things

The triple pattern with 3 variables matches every triple in the graph.

Note: Obviously, matching every triple in an RDF dataset can be a computionally expensive operation for large graphs.

Another note: Since we are only really interested in `?p`, another way to write the query pattern using blank node expressions would be `[?p []]`.

Again, see [Syntax for Blank Nodes](https://www.w3.org/TR/sparql12-query/#QSynBlankNodes).

---
<!-- highlight: 1, 5-->
## Grouping and Aggregation

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
## Same Old
The query is essentially a simple derivation of the Grouping and Aggregation example above. It partitions the entire graph according to `?p` and counts the solutions per group.

---
<!-- highlight: 3 -->
## Finding the Binding
The BIND expression defines a binding for `?p` and can be used to find the occurrence count of a predicate type `?p` in the graph.

E.g. one could find the number of type assertions by using `bind (rdf:type as ?p)`.

Note that for finding multiple predicate counts, either multiple BIND expressions or a VALUES clause can be used.
