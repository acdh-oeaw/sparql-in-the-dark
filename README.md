# SPARQL in the Dark ✨🌘

**Patterns for Exploring Uncharted DH Knowledge Graphs**

## Introduction
*SPARQL in the Dark* is a collection of practical SPARQL patterns and strategies for exploring unknown Knowledge Graphs.

The patterns presented here treat SPARQL as a discovery tool for incrementally (and often *maieutically*) revealing Knowledge Graph structure, entities, relationships, and modelling conventions - i.e. the data shapes manifested in a given graph.

This repository provides reusable SPARQL query templates, methodological notes, as well as examples and query strategies drawn from Digital Humanities datasets, but the patterns generalize to any unfamiliar RDF graph
## Table of Contents

- [Introduction to SPARQL Queries](#introduction-to-sparql-queries)
- [A very simple strategy](#a-very-simple-strategy)

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


