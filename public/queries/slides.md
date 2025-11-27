## The most basic query

This is a very simple SPARQL query.
<!-- .element: class="note" -->

```js []
SELECT *
WHERE {
  ?s ?p ?o;
}
```
<!-- .element data-id="code-animation" -->

---

It selects everything...

```js [1]
SELECT *
WHERE {
  ?s ?p ?o;
}
```
<!-- .element data-id="code-animation" -->



---

...where an arbitrary subject (`?s`) is somehow linked to an arbitrary object (`?o`).

```js [3]
SELECT *
WHERE {
  ?s ?p ?o;
}
```
<!-- .element data-id="code-animation" -->


