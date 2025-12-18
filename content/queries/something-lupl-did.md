# Preface
Before applying any of the patterns in this section, it is important to acknowledge two factors that significantly influence how SPARQL queries behave in practice - especially when aiming for generalized, triplestore-agnostic exploration.

## 1. Default-graph semantics (union vs. non-union).

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

## 2. Reasoning and entailment regimes.

If a targeted triplestore performs reasoning, queries run against both asserted and inferred triples, potentially yielding results that differ significantly from querying only the asserted graph.

Some patterns may yield richer results (due to inferred types, properties, and class hierarchies), while others may become noisier or misleading depending on the entailment regime (see e.g. [OWL Profiles](https://www.w3.org/TR/owl2-profiles/)).

Because inferencing varies widely across triple stores, the patterns in this repository assume no reasoning unless explicitly stated, and note where reasoning would meaningfully alter the behavior or usefulness of a given pattern.
