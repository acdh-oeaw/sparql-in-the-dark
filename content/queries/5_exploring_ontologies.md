# Ontologies and Namespaces

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
## Types of Types
The query generally aims to look for all entity-type-defining assertions.

Entity types in RDF are explicitely defined by asserting instances of a class or property, so the VALUES clause binds class and property types.

---
<!-- highlight: 13-14 -->
## Entity Identity
The simple triple pattern matches instances of the class and property types specified in the VALUES clause.


Type instances referenced by blank nodes are usually inferred and only of interest to reasoners, so those are FILTERed out.

---
<!-- highlight: 18 -->
## Regex Replace
The idea of this line in the query is to extract just the namespace from an entity IRI, i.e. to remove the entity name from the IRI.

In order to achieve this, the entity-defining `?term` is STR-cast and passed to the REPLACE function. 
The signature of REPLACE defines *argument*, *pattern* and *replacement* as parameters; 
the function matches the *pattern* against *argument* and replaces the match with *replacement*. See [REPLACE](https://www.w3.org/TR/sparql12-query/#func-replace) in the SPARQL 1.2 reference.

The regular expression here matches any character that is not "#" or "/" after the last "#" or "/" in the target string, essentially matching the last part (the entity name) in a fragment- or segment-delimited IRI.

The REPLACE function then replaces the pattern match with the empty string, effectively removing the entity name from the targeted IRI.

---
<!-- highlight: 17-20 -->
## Safe and Bound
The BIND expression in SPARQL establishes a variable bound to a value. In this case, the result of the REPLACE function is IRI-cast and bound to `?namespace`.

See [BIND](https://www.w3.org/TR/sparql12-query/#bind) in the SPARQL 1.2 reference.

---
<!-- highlight: 4 -->
## One of a Kind
RDF supports multi-typing, so in order to avoid duplicate values in the result, only DISTINCT values should be collected in queries asking for entity types.
