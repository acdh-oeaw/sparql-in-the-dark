# SPARQL in the Dark ✨🌘

**Patterns for Exploring Uncharted DH Knowledge Graphs**

## Introduction
*SPARQL in the Dark* is a collection of practical SPARQL patterns and strategies for exploring unknown Knowledge Graphs.

The patterns presented here treat SPARQL as a discovery tool for incrementally (and often *maieutically*) revealing Knowledge Graph structure, entities, relationships, and modelling conventions - i.e. the data shapes manifested in a given graph.

This repository provides reusable SPARQL query templates, methodological notes, as well as examples and query strategies drawn from Digital Humanities datasets, but the patterns generalize to any unfamiliar RDF graph
## Table of Contents

- [Introduction to SPARQL Queries](#introduction-to-sparql-queries)
- [Skeleton Heading](#skeleton-heading)
- [A very simple strategy](#a-very-simple-strategy)
- [Preface](#preface)

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


## Skeleton Heading
This is the intro across the whole page

### Arbitrary subheading
More text here

> Note that, for convenience and readability, the patterns in this repository do not include explicit UNION constructions and ergo target the default graph (however it might be constituted).

```sparql
Content of the first left query
Line 2
Line 3
Line 45
```

---

### Introduction
This is our very first SPARQL query. Let's take a closer look!

---
<!-- highlight: 3-4 -->
### A section with lighlighting
Section content

---
<!-- highlight: 1 -->
### Another section
Highlight line 1

===

## CHAPTER 2: Skeleton Heading
This is the intro across the whole page

### CHAPTER 2: Arbitrary subheading
More text here

```sparql
CHAPTER 2:
Content of the first left query
Line 2
Line 3
Line 4
```

---

### CHAPTER 2: Introduction
This is our very first SPARQL query. Let's take a closer look!

---
<!-- highlight: 3-4 -->
### CHAPTER 2: A section with lighlighting
Section content

---
<!-- highlight: 1 -->
### CHAPTER 2: Another section
Highlight line 1



## A very simple strategy
This is some strategy consisting of multiple queries.

### Step one
We already know this one.

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

### Step two
This is the same query again, hehe.

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


## Preface
Before applying any of the patterns in this section, it is important to acknowledge two factors that significantly influence how SPARQL queries behave in practice - especially when aiming for generalized, triplestore-agnostic exploration.

### 1. Default-graph semantics (union vs. non-union).

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

---

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
---

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
}
```

---

### 2. Reasoning and entailment regimes.

If a targeted triplestore performs reasoning, queries run against both asserted and inferred triples, potentially yielding results that differ significantly from querying only the asserted graph.

Some patterns may yield richer results (due to inferred types, properties, and class hierarchies), while others may become noisier or misleading depending on the entailment regime (see e.g. [OWL Profiles](https://www.w3.org/TR/owl2-profiles/)).

Because inferencing varies widely across triple stores, the patterns in this repository assume no reasoning unless explicitly stated, and note where reasoning would meaningfully alter the behavior or usefulness of a given pattern.


