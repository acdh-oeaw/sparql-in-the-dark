# A very simple strategy
This is some strategy consisting of multiple queries.

## Step one
We already know this one.

```sparql
# Find all countries and their capitals

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

## Step two
This is the same query again, hehe.

```sparql
# Find all countries and their capitals

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
