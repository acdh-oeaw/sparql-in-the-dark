<script lang="ts" setup>
import { QueryEngine } from "@comunica/query-sparql";
import {
	ChevronDownIcon,
	DatabaseIcon,
	LoaderCircleIcon,
	PlayIcon,
	TriangleAlertIcon,
} from "lucide-vue-next";

useSeoMeta({
	title: "Playground",
	description: "Run SPARQL queries against any endpoint, powered by Comunica.",
});

type SourceMode = "endpoint" | "rdf";

interface Example {
	label: string;
	mode: SourceMode;
	source?: string;
	data?: string;
	mediaType?: string;
	query: string;
}

const mediaTypes = [
	{ label: "Turtle", value: "text/turtle", highlight: "turtle" },
	{ label: "N-Triples", value: "application/n-triples", highlight: "turtle" },
	{ label: "TriG", value: "application/trig", highlight: "turtle" },
	{ label: "N-Quads", value: "application/n-quads", highlight: "turtle" },
	{ label: "JSON-LD", value: "application/ld+json", highlight: "json" },
	{ label: "RDF/XML", value: "application/rdf+xml", highlight: "xml" },
] as const;

const shakespeareData = `@prefix ex: <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

ex:Shakespeare a ex:Playwright ;
  rdfs:label "William Shakespeare" ;
  ex:born 1564 ;
  ex:died 1616 .

ex:Hamlet a ex:Play ;
  rdfs:label "Hamlet" ;
  ex:genre "Tragedy" ;
  dcterms:created "1600" ;
  ex:author ex:Shakespeare .

ex:Macbeth a ex:Play ;
  rdfs:label "Macbeth" ;
  ex:genre "Tragedy" ;
  dcterms:created "1606" ;
  ex:author ex:Shakespeare .

ex:RomeoAndJuliet a ex:Play ;
  rdfs:label "Romeo and Juliet" ;
  ex:genre "Tragedy" ;
  dcterms:created "1595" ;
  ex:author ex:Shakespeare .

ex:AMidsummerNightsDream a ex:Play ;
  rdfs:label "A Midsummer Night's Dream" ;
  ex:genre "Comedy" ;
  dcterms:created "1596" ;
  ex:author ex:Shakespeare .

ex:TwelfthNight a ex:Play ;
  rdfs:label "Twelfth Night" ;
  ex:genre "Comedy" ;
  dcterms:created "1601" ;
  ex:author ex:Shakespeare .

ex:HenryV a ex:Play ;
  rdfs:label "Henry V" ;
  ex:genre "History" ;
  dcterms:created "1599" ;
  ex:author ex:Shakespeare .
`;

const examples: Array<Example> = [
	{
		label: "Shakespeare (inline RDF)",
		mode: "rdf",
		mediaType: "text/turtle",
		data: shakespeareData,
		query: `PREFIX ex: <http://example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dcterms: <http://purl.org/dc/terms/>

SELECT ?title ?genre ?year WHERE {
  ?work ex:author ex:Shakespeare ;
        rdfs:label ?title ;
        ex:genre ?genre ;
        dcterms:created ?year .
}
ORDER BY ?year`,
	},
	{
		label: "Philosophers (DBpedia)",
		mode: "endpoint",
		source: "https://dbpedia.org/sparql",
		query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?person ?name WHERE {
  ?person a dbo:Philosopher ;
          rdfs:label ?name .
  FILTER(LANG(?name) = "en")
}
LIMIT 20`,
	},
	{
		label: "Cats (Wikidata)",
		mode: "endpoint",
		source: "https://query.wikidata.org/sparql",
		query: `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?item ?label WHERE {
  ?item wdt:P31 wd:Q146 ;
        rdfs:label ?label .
  FILTER(LANG(?label) = "en")
}
LIMIT 20`,
	},
];

const sourceMode = ref<SourceMode>(examples[0]!.mode);
const source = ref("https://dbpedia.org/sparql");
const rdfData = ref(examples[0]!.data ?? "");
const rdfMediaType = ref(examples[0]!.mediaType ?? "text/turtle");
const query = ref(examples[0]!.query);

const isRdfCollapsed = ref(false);

const rdfHighlightLang = computed(() => {
	return (
		mediaTypes.find((type) => {
			return type.value === rdfMediaType.value;
		})?.highlight ?? "turtle"
	);
});

const isRunning = ref(false);
const errorMessage = ref<string | null>(null);
const elapsed = ref<number | null>(null);

type ResultKind = "bindings" | "boolean" | "quads";
const resultKind = ref<ResultKind | null>(null);
const columns = ref<Array<string>>([]);
const rows = ref<Array<Record<string, string>>>([]);
const booleanResult = ref<boolean | null>(null);
const quads = ref<Array<{ subject: string; predicate: string; object: string }>>([]);

function resetResults() {
	errorMessage.value = null;
	resultKind.value = null;
	columns.value = [];
	rows.value = [];
	booleanResult.value = null;
	quads.value = [];
	elapsed.value = null;
}

async function runQuery() {
	if (isRunning.value) return;
	if (!query.value.trim()) {
		errorMessage.value = "Please provide a query.";
		return;
	}
	if (sourceMode.value === "endpoint" && !source.value.trim()) {
		errorMessage.value = "Please provide an endpoint URL.";
		return;
	}
	if (sourceMode.value === "rdf" && !rdfData.value.trim()) {
		errorMessage.value = "Please provide some RDF data to query.";
		return;
	}

	resetResults();
	isRunning.value = true;
	const startedAt = performance.now();

	try {
		const comunica = new QueryEngine();
		const sources =
			sourceMode.value === "rdf"
				? [
						{
							type: "serialized" as const,
							value: rdfData.value,
							mediaType: rdfMediaType.value,
							baseIRI: "http://example.org/",
						},
					]
				: [source.value.trim()];
		const result = await comunica.query(query.value, { sources });

		switch (result.resultType) {
			case "bindings": {
				const stream = await result.execute();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const bindings: Array<any> = await stream.toArray();
				const seen = new Set<string>();
				const columnOrder: Array<string> = [];
				const parsedRows = bindings.map((binding) => {
					const row: Record<string, string> = {};
					for (const [variable, term] of binding) {
						const key = variable.value;
						if (!seen.has(key)) {
							seen.add(key);
							columnOrder.push(key);
						}
						row[key] = term.value;
					}
					return row;
				});
				columns.value = columnOrder;
				rows.value = parsedRows;
				resultKind.value = "bindings";
				break;
			}
			case "boolean": {
				booleanResult.value = await result.execute();
				resultKind.value = "boolean";
				break;
			}
			case "quads": {
				const stream = await result.execute();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const collected: Array<any> = await stream.toArray();
				quads.value = collected.map((quad) => {
					return {
						subject: quad.subject.value,
						predicate: quad.predicate.value,
						object: quad.object.value,
					};
				});
				resultKind.value = "quads";
				break;
			}
			default: {
				errorMessage.value = "The query executed but returned no displayable results.";
			}
		}
	} catch (error) {
		errorMessage.value = error instanceof Error ? error.message : String(error);
	} finally {
		elapsed.value = Math.round(performance.now() - startedAt);
		// eslint-disable-next-line require-atomic-updates -- guarded against re-entry via isRunning
		isRunning.value = false;
	}
}

function loadExample(example: Example) {
	sourceMode.value = example.mode;
	if (example.mode === "endpoint") {
		source.value = example.source ?? "";
	} else {
		rdfData.value = example.data ?? "";
		rdfMediaType.value = example.mediaType ?? "text/turtle";
		isRdfCollapsed.value = false;
	}
	query.value = example.query;
	resetResults();
}

function onKeydown(event: KeyboardEvent) {
	if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
		event.preventDefault();
		void runQuery();
	}
}
</script>

<template>
	<MainContent>
		<div class="mx-auto max-w-5xl">
			<div class="mb-10">
				<h1 class="mb-3 text-4xl font-bold text-white md:text-5xl">Playground</h1>
				<p class="text-lg text-slate-400 md:text-xl">
					Run your own SPARQL queries against a remote endpoint or over an RDF document you paste in
					yourself.
				</p>
			</div>

			<!-- Examples -->
			<div class="mb-6 flex flex-wrap items-center gap-3">
				<span class="font-mono text-xs tracking-widest text-slate-500 uppercase">Examples</span>
				<button
					v-for="example in examples"
					:key="example.label"
					class="rounded-full border border-white/10 bg-surface-dark/50 px-4 py-1.5 text-sm text-slate-300 transition-colors hover:border-primary/50 hover:text-white"
					type="button"
					@click="loadExample(example)"
				>
					{{ example.label }}
				</button>
			</div>

			<!-- Source mode -->
			<div class="mb-6">
				<span class="mb-2 block font-mono text-xs tracking-widest text-slate-500 uppercase">
					Data source
				</span>
				<div class="inline-flex rounded-lg border border-white/10 bg-surface-dark/50 p-1">
					<button
						class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
						:class="
							sourceMode === 'endpoint'
								? 'bg-primary text-background-dark'
								: 'text-slate-400 hover:text-white'
						"
						type="button"
						@click="sourceMode = 'endpoint'"
					>
						SPARQL endpoint
					</button>
					<button
						class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
						:class="
							sourceMode === 'rdf'
								? 'bg-primary text-background-dark'
								: 'text-slate-400 hover:text-white'
						"
						type="button"
						@click="sourceMode = 'rdf'"
					>
						RDF data
					</button>
				</div>
			</div>

			<!-- Endpoint -->
			<label v-if="sourceMode === 'endpoint'" class="mb-6 block">
				<span
					class="mb-2 flex items-center gap-2 font-mono text-xs tracking-widest text-slate-500 uppercase"
				>
					<DatabaseIcon class="size-3.5" />
					Endpoint
				</span>
				<input
					v-model="source"
					class="w-full rounded-xl border border-white/10 bg-[#151928] px-4 py-3 font-mono text-sm text-slate-200 transition-colors outline-none placeholder:text-slate-600 focus:border-primary/50"
					placeholder="https://dbpedia.org/sparql"
					spellcheck="false"
					type="url"
				/>
			</label>

			<!-- Inline RDF data -->
			<div v-else class="mb-6">
				<div class="mb-2 flex items-center justify-between gap-4">
					<button
						:aria-expanded="!isRdfCollapsed"
						class="flex items-center gap-2 font-mono text-xs tracking-widest text-slate-500 uppercase transition-colors hover:text-white"
						type="button"
						@click="isRdfCollapsed = !isRdfCollapsed"
					>
						<ChevronDownIcon
							class="size-3.5 transition-transform"
							:class="isRdfCollapsed ? '-rotate-90' : ''"
						/>
						<DatabaseIcon class="size-3.5" />
						RDF data
					</button>
					<label class="flex items-center gap-2">
						<span class="font-mono text-xs tracking-widest text-slate-500 uppercase">Format</span>
						<select
							v-model="rdfMediaType"
							class="rounded-lg border border-white/10 bg-surface-dark px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-primary/50"
						>
							<option v-for="type in mediaTypes" :key="type.value" :value="type.value">
								{{ type.label }}
							</option>
						</select>
					</label>
				</div>
				<div v-show="!isRdfCollapsed">
					<div
						class="overflow-hidden rounded-xl border border-white/10 bg-[#151928] shadow-2xl ring-1 shadow-black/50 ring-white/5"
					>
						<div
							class="flex items-center justify-between border-b border-white/5 bg-[#1a1f30] px-4 py-3"
						>
							<div class="flex items-center gap-2">
								<div class="size-3 rounded-full border border-red-500/50 bg-red-500/20"></div>
								<div class="size-3 rounded-full border border-yellow-500/50 bg-yellow-500/20"></div>
								<div class="size-3 rounded-full border border-green-500/50 bg-green-500/20"></div>
							</div>
							<div class="font-mono text-xs text-slate-500">data</div>
						</div>
						<CodeHighlighter
							v-model:code="rdfData"
							class="max-h-[50vh] min-h-48 py-4"
							editable
							:language="rdfHighlightLang"
						/>
					</div>
					<p class="mt-2 font-mono text-xs text-slate-500">
						Queried locally in your browser — no request leaves the page.
					</p>
				</div>
			</div>

			<!-- Query editor -->
			<div
				class="overflow-hidden rounded-xl border border-white/10 bg-[#151928] shadow-2xl ring-1 shadow-black/50 ring-white/5"
			>
				<div
					class="flex items-center justify-between border-b border-white/5 bg-[#1a1f30] px-4 py-3"
				>
					<div class="flex items-center gap-2">
						<div class="size-3 rounded-full border border-red-500/50 bg-red-500/20"></div>
						<div class="size-3 rounded-full border border-yellow-500/50 bg-yellow-500/20"></div>
						<div class="size-3 rounded-full border border-green-500/50 bg-green-500/20"></div>
					</div>
					<div class="font-mono text-xs text-slate-500">query.sparql</div>
				</div>
				<CodeHighlighter
					v-model:code="query"
					class="max-h-[60vh] min-h-64 py-4"
					editable
					language="sparql"
					@keydown="onKeydown"
				/>
			</div>

			<!-- Actions -->
			<div class="mt-4 flex flex-wrap items-center gap-4">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-background-dark transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
					:disabled="isRunning"
					type="button"
					@click="runQuery"
				>
					<LoaderCircleIcon v-if="isRunning" class="size-4 animate-spin" />
					<PlayIcon v-else class="size-4" />
					{{ isRunning ? "Running…" : "Run query" }}
				</button>
				<span class="font-mono text-xs text-slate-500">
					<kbd class="rounded-sm border border-white/10 bg-surface-dark px-1.5 py-0.5">Ctrl</kbd> +
					<kbd class="rounded-sm border border-white/10 bg-surface-dark px-1.5 py-0.5">Enter</kbd>
					to run
				</span>
				<span v-if="elapsed !== null && !isRunning" class="font-mono text-xs text-slate-500">
					{{ elapsed }} ms
				</span>
			</div>

			<!-- Error -->
			<div
				v-if="errorMessage"
				class="mt-8 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200"
			>
				<TriangleAlertIcon class="mt-0.5 size-5 shrink-0 text-red-400" />
				<div>
					<p class="mb-1 font-semibold text-red-300">Query failed</p>
					<p class="font-mono wrap-break-word whitespace-pre-wrap">{{ errorMessage }}</p>
				</div>
			</div>

			<!-- Results -->
			<div v-if="resultKind && !errorMessage" class="mt-8">
				<h2 class="mb-4 font-mono text-xs tracking-widest text-slate-500 uppercase">Results</h2>

				<!-- SELECT -->
				<div
					v-if="resultKind === 'bindings'"
					class="overflow-hidden rounded-xl border border-white/10 bg-surface-dark/50"
				>
					<div v-if="rows.length === 0" class="p-6 text-slate-400">The query returned no rows.</div>
					<div v-else class="overflow-x-auto">
						<table class="w-full border-collapse text-left text-sm">
							<thead>
								<tr class="border-b border-white/10 bg-[#1a1f30]">
									<th
										v-for="column in columns"
										:key="column"
										class="px-4 py-3 font-mono text-xs tracking-wider text-primary"
									>
										{{ column }}
									</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="(row, index) in rows"
									:key="index"
									class="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
								>
									<td
										v-for="column in columns"
										:key="column"
										class="max-w-md truncate px-4 py-3 font-mono text-slate-300"
										:title="row[column] ?? ''"
									>
										<a
											v-if="row[column]?.startsWith('http')"
											:href="row[column] ?? ''"
											target="_blank"
											>{{ row[column] ?? "" }}</a
										>
										<span v-else>{{ row[column] ?? "" }}</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div
						v-if="rows.length > 0"
						class="border-t border-white/10 px-4 py-2 font-mono text-xs text-slate-500"
					>
						{{ rows.length }} row{{ rows.length === 1 ? "" : "s" }}
					</div>
				</div>

				<!-- ASK -->
				<div
					v-else-if="resultKind === 'boolean'"
					class="rounded-xl border border-white/10 bg-surface-dark/50 p-6"
				>
					<span
						class="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold"
						:class="booleanResult ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'"
					>
						{{ booleanResult }}
					</span>
				</div>

				<!-- CONSTRUCT / DESCRIBE -->
				<div
					v-else-if="resultKind === 'quads'"
					class="overflow-hidden rounded-xl border border-white/10 bg-surface-dark/50"
				>
					<div v-if="quads.length === 0" class="p-6 text-slate-400">
						The query returned no triples.
					</div>
					<div v-else class="overflow-x-auto">
						<table class="w-full border-collapse text-left text-sm">
							<thead>
								<tr class="border-b border-white/10 bg-[#1a1f30]">
									<th class="px-4 py-3 font-mono text-xs tracking-wider text-primary">subject</th>
									<th class="px-4 py-3 font-mono text-xs tracking-wider text-primary">predicate</th>
									<th class="px-4 py-3 font-mono text-xs tracking-wider text-primary">object</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="(quad, index) in quads"
									:key="index"
									class="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
								>
									<td
										class="max-w-xs truncate px-4 py-3 font-mono text-slate-300"
										:title="quad.subject"
									>
										{{ quad.subject }}
									</td>
									<td
										class="max-w-xs truncate px-4 py-3 font-mono text-slate-300"
										:title="quad.predicate"
									>
										{{ quad.predicate }}
									</td>
									<td
										class="max-w-xs truncate px-4 py-3 font-mono text-slate-300"
										:title="quad.object"
									>
										{{ quad.object }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div
						v-if="quads.length > 0"
						class="border-t border-white/10 px-4 py-2 font-mono text-xs text-slate-500"
					>
						{{ quads.length }} triple{{ quads.length === 1 ? "" : "s" }}
					</div>
				</div>
			</div>
			<p class="float-right text-sm text-slate-400">
				Query engine powered by
				<a
					class="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
					href="https://comunica.dev/"
					rel="noreferrer"
					target="_blank"
					>Comunica</a
				>.
			</p>
		</div>
	</MainContent>
</template>
