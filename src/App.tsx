import { useState, useEffect } from 'react';

const sections = [
  { id: 's1', num: '1', title: 'Scope & Invariants' },
  { id: 's2', num: '2', title: 'Entity Registry' },
  { id: 's3', num: '3', title: 'Identity Contract' },
  { id: 's4', num: '4', title: 'Object Storage Contract' },
  { id: 's5', num: '5', title: 'Canonical Object Format' },
  { id: 's6', num: '6', title: 'Segment Contract' },
  { id: 's7', num: '7', title: 'Manticore Schema' },
  { id: 's8', num: '8', title: 'Retrieval Contract' },
  { id: 's9', num: '9', title: 'Reprojection' },
  { id: 's10', num: '10', title: 'Redaction & Tombstones' },
  { id: 's11', num: '11', title: 'Adapter Interfaces' },
  { id: 's12', num: '12', title: 'Topology & Cache' },
  { id: 's13', num: '13', title: 'Validation Gates' },
  { id: 'appendix', num: 'A', title: 'Taxonomy Lock v2' },
];

function Sidebar({ activeSection }: { activeSection: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <nav className="py-6 px-3">
      <div className="mb-6 px-3">
        <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">LEVERAGEAI</div>
        <div className="text-xs text-slate-500">AGENT-HISTORY · P1</div>
      </div>
      <div className="space-y-0.5">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`nav-link ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-slate-600 mr-2 text-xs font-mono">{s.num}</span>
            {s.title}
          </a>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0d1321] border-r border-slate-800 overflow-y-auto z-40 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function KeyPoint({ children }: { children: React.ReactNode }) {
  return (
    <div className="key-point">
      <div className="label">Key Point</div>
      <p>{children}</p>
    </div>
  );
}

function Tldr({ children }: { children: React.ReactNode }) {
  return (
    <div className="tldr">
      <div className="label">TL;DR</div>
      <p>{children}</p>
    </div>
  );
}

function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <pre className="relative">
      {lang && (
        <span className="absolute top-2 right-3 text-xs text-slate-600 font-mono">{lang}</span>
      )}
      <code>{children}</code>
    </pre>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('s1');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Sidebar activeSection={activeSection} />

      {/* Main content */}
      <main className="lg:ml-72">
        {/* Header */}
        <header className="border-b border-slate-800 bg-[#0d1321]/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Storage, Index & Segment Contract
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Package P1 · Binding immutable storage, search projection, and byte-addressable segments
              </p>
            </div>
            <span className="badge badge-draft">DRAFT</span>
          </div>
        </header>

        {/* Meta bar */}
        <div className="max-w-4xl mx-auto px-6 py-4 border-b border-slate-800/50">
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>P1 · DRAFT 2026-09-05</span>
            <span className="text-slate-700">·</span>
            <span>SUPERSEDES NOTHING</span>
            <span className="text-slate-700">·</span>
            <span>DEPENDS ON P0</span>
            <span className="text-slate-700">·</span>
            <span>MANTICORE 13.11.0+</span>
          </div>
          <p className="text-sm text-slate-400 mt-3 italic">
            No storage provider, search engine, embedding model, or agent provider owns canonical identity.
          </p>
        </div>

        {/* Document body */}
        <div className="max-w-4xl mx-auto px-6 py-8 prose-doc">

          {/* Section 1 */}
          <section id="s1">
            <h2>1 · Scope & Invariants</h2>
            <Tldr>P1 defines exactly three things — how bytes are stored, how segments address those bytes, and how Manticore projects them — and defines nothing about agents, UI, or capture.</Tldr>

            <p>P0 established the canonical history contract and repository layout. P1 sits directly beneath it and answers a narrower question: given a canonical session, where do its bytes live, how is a 17 KB slice of a 400 MB object addressed, and what does the search projection have to hold for that address to be resolvable from any machine.</p>

            <h3>In scope</h3>
            <ul>
              <li>Object storage key conventions, immutability rules, and encoding constraints</li>
              <li>The canonical object serialization format and its byte-index derivation</li>
              <li>The <code>segment</code> entity: byte ranges, text ranges, and storage locators</li>
              <li>Manticore DDL for the catalog and segment tables</li>
              <li>Reprojection, redaction, and the five adapter interfaces</li>
            </ul>

            <h3>Out of scope</h3>
            <ul>
              <li>Capture mechanics per harness — that is P0's adapter surface</li>
              <li>Context pack assembly and ranking policy — P2</li>
              <li>Manticore Studio UI — P3</li>
              <li>Analytical projection (Parquet / DuckDB) — deferred, see §9</li>
            </ul>

            <h3>The four invariants</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '4rem' }}></th>
                  <th>What</th>
                  <th>What breaks if violated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">I-1</td>
                  <td>Canonical identity is owned by the catalog, never by a storage provider, search engine, or embedding model.</td>
                  <td>Swapping R2 for B2, or Manticore for anything else, becomes a migration instead of a config change.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">I-2</td>
                  <td>Manticore holds zero state that does not exist in the bucket. It is droppable and fully rebuildable.</td>
                  <td>The index becomes a database of record; auditability claim collapses.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">I-3</td>
                  <td>Stored objects are immutable and content-addressed. Bytes never change under an offset.</td>
                  <td>Every stored byte range silently becomes wrong; corruption is undetectable.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">I-4</td>
                  <td>Every machine holds the complete catalog; only the searchable representation is selectively projected.</td>
                  <td>A partial index cannot distinguish "does not exist" from "I do not have it" — siloing returns.</td>
                </tr>
              </tbody>
            </table>
            <KeyPoint>Anything that cannot be rebuilt from the bucket does not belong in this system's search layer.</KeyPoint>
          </section>

          {/* Section 2 */}
          <section id="s2">
            <h2>2 · Entity Registry</h2>
            <Tldr>P0's eleven entities and the two introduced later — <code>segment</code> and <code>object</code> — are reconciled here into one registry; there is no second list anywhere.</Tldr>

            <p>Drafting produced two overlapping hierarchies. P0 named <code>source, provider, harness, capture, session, message, tool-event, artifact-reference, context-pack, manifest, run</code>. Later architecture work introduced <code>segment</code> and <code>object</code> while dropping <code>capture</code>, <code>run</code>, <code>source</code>, and <code>manifest</code> from view. Both are correct at different altitudes. This is the merge.</p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Plane</th>
                  <th>Definition</th>
                  <th>Owns bytes?</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="font-semibold text-white">source</td><td><span className="badge badge-plane">EXECUTION</span></td><td>A machine + account pairing that produced captures.</td><td>No</td></tr>
                <tr><td className="font-semibold text-white">provider</td><td><span className="badge badge-plane">EXECUTION</span></td><td>The model vendor: <code>anthropic</code>, <code>openai</code>, <code>google</code>.</td><td>No</td></tr>
                <tr><td className="font-semibold text-white">harness</td><td><span className="badge badge-plane">EXECUTION</span></td><td>The CLI or runtime: <code>claude-code</code>, <code>codex-cli</code>, <code>gemini-cli</code>, <code>pi-code</code>.</td><td>No</td></tr>
                <tr><td className="font-semibold text-white">run</td><td><span className="badge badge-plane">EXECUTION</span></td><td>One invocation of the pipeline. Groups captures processed together.</td><td>No</td></tr>
                <tr><td className="font-semibold text-white">capture</td><td><span className="badge badge-plane">EVIDENCE</span></td><td>One immutable ingestion of raw provider output. L1.</td><td>Yes — raw</td></tr>
                <tr><td className="font-semibold text-white">object</td><td><span className="badge badge-plane">EVIDENCE</span></td><td>A content-addressed blob in a bucket. The unit of storage, not of meaning.</td><td>Yes</td></tr>
                <tr><td className="font-semibold text-white">manifest</td><td><span className="badge badge-plane">EVIDENCE</span></td><td>The durable reconstruction record: which objects exist, their hashes, replicas, and lifecycle events.</td><td>Yes — small</td></tr>
                <tr><td className="font-semibold text-white">session</td><td><span className="badge badge-plane">KNOWLEDGE</span></td><td>One provider-independent conversation, normalized from one or more captures. L2.</td><td>Yes — canonical</td></tr>
                <tr><td className="font-semibold text-white">message</td><td><span className="badge badge-plane">KNOWLEDGE</span></td><td>One turn within a session. Contains content blocks.</td><td>No — a line in the session object</td></tr>
                <tr><td className="font-semibold text-white">tool-event</td><td><span className="badge badge-plane">KNOWLEDGE</span></td><td>One tool invocation and its result, paired.</td><td>No — a line in the session object</td></tr>
                <tr><td className="font-semibold text-white">artifact-reference</td><td><span className="badge badge-plane">KNOWLEDGE</span></td><td>A pointer from a session to a produced artifact.</td><td>No</td></tr>
                <tr><td className="font-semibold text-white">artifact</td><td><span className="badge badge-plane">KNOWLEDGE</span></td><td>A produced thing: file, screenshot, PDF, repo snapshot. Versioned.</td><td>Yes</td></tr>
                <tr><td className="font-semibold text-white">segment</td><td><span className="badge badge-plane">CONTEXT</span></td><td>An addressable slice of an object: byte range, text range, locator, semantics. The retrieval unit.</td><td>No — addresses bytes</td></tr>
                <tr><td className="font-semibold text-white">context-pack</td><td><span className="badge badge-plane">CONTEXT</span></td><td>An assembled set of segments prepared for a resuming agent. L7.</td><td>No</td></tr>
              </tbody>
            </table>

            <p><strong>The distinction that matters:</strong> <code>object</code> is a storage fact, <code>segment</code> is a retrieval fact, and <code>message</code> is a knowledge fact. One message maps to exactly one segment maps to one byte range in one object — but the three IDs are not interchangeable and must never be collapsed into a single column.</p>

            <KeyPoint>Thirteen entities across four planes; any document introducing a fourteenth must amend this registry rather than define its own.</KeyPoint>
          </section>

          {/* Section 3 */}
          <section id="s3">
            <h2>3 · Identity Contract</h2>
            <Tldr>Every entity carries a branded, prefixed, lexicographically sortable string ID minted by the catalog — never a provider ID, never a bucket key, never a Manticore document ID.</Tldr>

            <h3>Format</h3>
            <CodeBlock lang="text">{`<prefix>_<26-char Crockford base32 ULID>

ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH
seg_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ`}</CodeBlock>

            <p>ULIDs are used rather than UUIDv4 because the leading 48 bits are a millisecond timestamp, which makes IDs sort chronologically as plain strings. That property is load-bearing: it lets the catalog range-scan by ID prefix and lets Manticore sort by ID without touching a timestamp attribute.</p>

            <table className="doc-table">
              <thead>
                <tr><th>Prefix</th><th>Entity</th><th>Minted when</th></tr>
              </thead>
              <tbody>
                <tr><td className="font-mono text-sky-400">src_</td><td>source</td><td>Machine first registers</td></tr>
                <tr><td className="font-mono text-sky-400">run_</td><td>run</td><td>Pipeline invocation starts</td></tr>
                <tr><td className="font-mono text-sky-400">cap_</td><td>capture</td><td>Raw bytes land in the bucket</td></tr>
                <tr><td className="font-mono text-sky-400">obj_</td><td>object</td><td>First time a hash is seen</td></tr>
                <tr><td className="font-mono text-sky-400">ses_</td><td>session</td><td>Normalization produces a canonical session</td></tr>
                <tr><td className="font-mono text-sky-400">msg_</td><td>message</td><td>Normalization, per turn</td></tr>
                <tr><td className="font-mono text-sky-400">tev_</td><td>tool-event</td><td>Normalization, per invocation</td></tr>
                <tr><td className="font-mono text-sky-400">art_ / arv_</td><td>artifact / artifact version</td><td>Artifact first referenced / each new hash</td></tr>
                <tr><td className="font-mono text-sky-400">seg_</td><td>segment</td><td>Segmentation pass over a canonical object</td></tr>
                <tr><td className="font-mono text-sky-400">ctx_</td><td>context-pack</td><td>Assembly request</td></tr>
              </tbody>
            </table>

            <p>Provider session identifiers — Claude Code's UUID filenames, Codex's run IDs — are stored as <code>provider_native_id</code> on the session record for provenance. They are never used as keys, never joined on, and never surfaced to an agent.</p>

            <h3>Object identity is dual</h3>
            <p>An object has two identities and both are required. <code>object_id</code> is the catalog's branded handle, stable across re-replication. <code>content_hash</code> is <code>sha256</code> of the exact stored bytes, and it is what makes byte offsets safe. If two captures produce identical bytes, they share one <code>content_hash</code> and one physical blob, but the catalog may still record two <code>capture</code> rows pointing at it.</p>

            <KeyPoint>An ID that came from outside the system is provenance metadata, never a key.</KeyPoint>
          </section>

          {/* Section 4 */}
          <section id="s4">
            <h2>4 · Object Storage Contract</h2>
            <Tldr>Objects are content-addressed, stored uncompressed at rest, and written exactly once — the three properties that together make a byte offset a durable address rather than a guess.</Tldr>

            <h3>Key convention</h3>
            <CodeBlock lang="text">{`objects/<hash[0:2]>/<hash[2:4]>/<hash>

objects/9f/2c/9f2ca7e1b04d…c88  ← raw capture
objects/41/8b/418b03fd97ae…12a  ← canonical session (JSONL)
objects/d0/77/d07751cc2b6f…9e4  ← artifact version`}</CodeBlock>

            <p>The two-level fan-out exists so that any bucket listing or local mirror stays navigable at tens of millions of objects. Human-meaningful paths (<code>claude-code/2026/09/…</code>) live in the manifest as aliases; they are never the storage key, because a rename must never move bytes.</p>

            <h3>Encoding rules — non-negotiable</h3>
            <h4 className="text-emerald-400 text-sm font-semibold mt-4 mb-2">Required</h4>
            <ul>
              <li>Stored uncompressed at rest</li>
              <li>UTF-8, no BOM</li>
              <li>LF line endings only</li>
              <li>Byte offsets, never character offsets</li>
              <li>Every offset lands on a UTF-8 boundary</li>
            </ul>

            <h4 className="text-red-400 text-sm font-semibold mt-4 mb-2">Forbidden</h4>
            <ul>
              <li>Server-side or client-side gzip on canonical objects</li>
              <li>Transfer encodings that alter stored bytes</li>
              <li>Overwriting an existing key</li>
              <li>Re-serializing an object "for tidiness"</li>
              <li>CRLF anywhere in the pipeline</li>
            </ul>

            <p>Compression is the single highest-risk failure in this design. A range GET returns the <em>stored</em> bytes. If an object is stored gzipped, every offset held in Manticore silently addresses compressed garbage — and it fails quietly, returning plausible-looking binary rather than an error. Large raw captures may be compressed only if the object is flagged <code>range_addressable = 0</code>, which excludes it from segmentation.</p>

            <h3>Replica placement</h3>
            <CodeBlock lang="yaml">{`object:
  object_id:      obj_01JQ8Z…
  content_hash:   sha256:9f2ca7e1…
  size_bytes:     419430400
  range_addressable: 1
  replicas:
    - provider: r2      status: verified  verified_at: 2026-09-05T18:02:11Z
    - provider: b2      status: verified  verified_at: 2026-09-05T18:04:39Z
  durability:
    replica_count: 2
    provider_count: 2`}</CodeBlock>

            <p>Replicas must be byte-identical, verified by re-hashing rather than by trusting the provider's ETag — multipart uploads produce ETags that are not content hashes. A replica that fails verification is marked <code>divergent</code> and removed from the resolver's candidate set; it is never silently preferred because it responded faster.</p>

            <KeyPoint>A byte offset is only an address if the bytes are immutable, uncompressed, and hash-verified across every replica that might serve them.</KeyPoint>
          </section>

          {/* Section 5 */}
          <section id="s5">
            <h2>5 · Canonical Object Format</h2>
            <Tldr>A canonical session is JSONL — one message or tool-event per line — which makes the byte index a byproduct of writing rather than a parsing problem.</Tldr>

            <p>The alternative, a single pretty-printed JSON document, forces the segmenter to re-parse the whole object to find any boundary, and forces every range read to be reassembled before it can be understood. JSONL removes both problems. The writer knows each line's offset as it writes, and a range read returns whole lines that <code>JSON.parse</code> accepts directly.</p>

            <h3>Line grammar</h3>
            <CodeBlock lang="text">{`line 0     {"kind":"header","session_id":"ses_…","schema":"p0.session/1"}
line 1..n  {"kind":"message","message_id":"msg_…","seq":1,…}
           {"kind":"tool_event","tool_event_id":"tev_…","seq":2,…}
           {"kind":"artifact_ref","artifact_id":"art_…","seq":3,…}
line n+1   {"kind":"footer","counts":{…},"content_hash_of_body":"sha256:…"}`}</CodeBlock>

            <p>Serialization must be deterministic or the hash is meaningless across rebuilds: keys sorted, no insignificant whitespace, <code>\n</code> terminator on every line including the last, and non-ASCII emitted as literal UTF-8 rather than <code>\u</code> escapes.</p>

            <h3>Offsets are produced at write time</h3>
            <CodeBlock lang="typescript">{`let offset = 0n;
for (const record of records) {
  const line: Buffer = Buffer.from(serializeDeterministic(record) + "\\n", "utf8");
  segments.push({
    kind:       record.kind,
    ref_id:     record.message_id ?? record.tool_event_id,
    seq:        record.seq,
    byte_start: offset,
    byte_len:   BigInt(line.byteLength),
  });
  offset += BigInt(line.byteLength);
  await sink.write(line);
}`}</CodeBlock>

            <p><code>BigInt</code> is not decoration. A 400 MB object exceeds nothing, but a repository snapshot or a long video artifact will exceed <code>Number.MAX_SAFE_INTEGER</code> far less readily than it exceeds a 32-bit integer — and Manticore's <code>int</code> is 32-bit unsigned, capping at ~4.29 GB. Offsets are <code>bigint</code> in TypeScript and <code>bigint</code> in Manticore, everywhere, without exception.</p>

            <KeyPoint>Choosing a line-delimited canonical format converts the hardest part of byte-addressable retrieval into arithmetic performed once at write time.</KeyPoint>
          </section>

          {/* Section 6 */}
          <section id="s6">
            <h2>6 · Segment Contract</h2>
            <Tldr>A segment binds a knowledge entity to an exact byte range in an exact object, plus a text projection cheap enough to answer most queries without any bucket call at all.</Tldr>

            <h3>Fields</h3>
            <table className="doc-table">
              <thead>
                <tr><th>Field</th><th>Type</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td className="font-mono text-sky-300">segment_id</td><td>string</td><td>Branded ID, <code>seg_</code>.</td></tr>
                <tr><td className="font-mono text-sky-300">session_id</td><td>string</td><td>Owning session. Always present.</td></tr>
                <tr><td className="font-mono text-sky-300">ref_kind</td><td>enum</td><td><code>message</code> | <code>tool_event</code> | <code>artifact_ref</code> | <code>span</code>.</td></tr>
                <tr><td className="font-mono text-sky-300">ref_id</td><td>string</td><td>The <code>msg_</code> / <code>tev_</code> / <code>art_</code> this segment materializes.</td></tr>
                <tr><td className="font-mono text-sky-300">seq</td><td>int</td><td>Ordinal within the session. Drives <code>expand()</code> neighbourhoods.</td></tr>
                <tr><td className="font-mono text-sky-300">object_id</td><td>string</td><td>The object the bytes live in.</td></tr>
                <tr><td className="font-mono text-sky-300">byte_start</td><td>bigint</td><td>Offset from byte zero of the stored object.</td></tr>
                <tr><td className="font-mono text-sky-300">byte_len</td><td>bigint</td><td>Length in bytes. Stored rather than <code>byte_end</code> to remove off-by-one ambiguity.</td></tr>
                <tr><td className="font-mono text-sky-300">text_start / text_len</td><td>bigint</td><td>Offsets into the extracted text projection, for highlighting.</td></tr>
                <tr><td className="font-mono text-sky-300">token_estimate</td><td>int</td><td>Cost signal returned to agents before they fetch.</td></tr>
                <tr><td className="font-mono text-sky-300">body_text</td><td>text</td><td>The extracted, noise-stripped text. Indexed and embedded.</td></tr>
              </tbody>
            </table>

            <h3>byte_range and text_range are not the same range</h3>
            <p>The byte range addresses the canonical JSONL line, including its JSON envelope, tool payload, and metadata. The text range addresses the stripped prose inside the extracted projection. A highlighted match at <code>text_start = 412</code> does not sit at <code>byte_start + 412</code>, and conflating the two produces highlights that drift further as messages grow. Both are stored; neither is derived from the other at query time.</p>

            <h3>Segmentation policy</h3>
            <ul>
              <li>One segment per canonical line, always. This is the deterministic floor.</li>
              <li>Long assistant messages may additionally produce <code>ref_kind = span</code> sub-segments whose byte ranges are strictly contained by their parent line's range.</li>
              <li>Sub-segments split on paragraph or fenced-code boundaries, never mid-token, and never across a UTF-8 boundary.</li>
              <li>Tool outputs above a size threshold are segmented but their <code>body_text</code> is truncated with a <code>truncated = 1</code> flag; the full payload stays fetchable by range.</li>
            </ul>

            <KeyPoint>The segment is the only entity in the system that knows both what something means and where its bytes physically are.</KeyPoint>
          </section>

          {/* Section 7 */}
          <section id="s7">
            <h2>7 · Manticore Schema</h2>
            <Tldr>Two real-time tables — <code>catalog</code> for existence and <code>segment</code> for retrieval — with auto-embeddings on the ONNX path and columnar storage on every filterable attribute except JSON.</Tldr>

            <p>Verified against the Manticore manual on 2026-09-05. Auto-embeddings require 13.11.0 or later. Three constraints from the docs shape this schema directly: <code>float_vector</code> is supported only in real-time tables and cannot be <code>UPDATE</code>d (use <code>REPLACE</code>); <code>json</code> attributes are not supported by columnar storage and must stay row-wise; and <code>int</code> is 32-bit unsigned, so all byte offsets are <code>bigint</code>.</p>

            <h3>7.1 catalog — knowledge of existence</h3>
            <CodeBlock lang="sql">{`CREATE TABLE catalog (
    object_id        string attribute,
    content_hash     string attribute,
    entity_kind      string attribute engine='columnar',
    session_id       string attribute engine='columnar',
    provider         string attribute engine='columnar',
    harness          string attribute engine='columnar',
    project          string attribute engine='columnar',
    repo             string attribute engine='columnar',
    branch           string attribute engine='columnar',
    created_at       timestamp        engine='columnar',
    ingested_at      timestamp        engine='columnar',
    size_bytes       bigint           engine='columnar',
    range_addressable bool,
    replica_count    int              engine='columnar',
    lifecycle        string attribute engine='columnar',
    provider_native_id string attribute,
    meta             json
) engine='rowwise';`}</CodeBlock>

            <p><code>lifecycle</code> takes <code>active</code>, <code>tombstoned</code>, or <code>purged</code> — see §10. The table is declared <code>rowwise</code> with columnar opted in per attribute, rather than the inverse, because <code>meta json</code> cannot be columnar and a table-level <code>columnar</code> declaration would force an override on it anyway.</p>

            <h3>7.2 segment — searchable representation</h3>
            <CodeBlock lang="sql">{`CREATE TABLE segment (
    body_text        text,
    segment_id       string attribute,
    session_id       string attribute engine='columnar',
    ref_kind         string attribute engine='columnar',
    ref_id           string attribute,
    seq              int              engine='columnar',

    object_id        string attribute,
    byte_start       bigint           engine='columnar',
    byte_len         bigint           engine='columnar',
    text_start       bigint,
    text_len         bigint,

    provider         string attribute engine='columnar',
    harness          string attribute engine='columnar',
    project          string attribute engine='columnar',
    logical_category string attribute engine='columnar',
    created_at       timestamp        engine='columnar',
    token_estimate   int              engine='columnar',
    truncated        bool,
    embed_model      string attribute engine='columnar',

    body_vector      float_vector
        KNN_TYPE='hnsw'
        HNSW_SIMILARITY='cosine'
        MODEL_NAME='Xenova/all-MiniLM-L6-v2'
        FROM='body_text'
) engine='rowwise';`}</CodeBlock>

            <p>The ONNX path is chosen deliberately over <code>sentence-transformers/all-MiniLM-L6-v2</code>; the manual reports the ONNX Runtime backend at roughly fourteen times the throughput of the Candle path on identical hardware, and the initial corpus ingest is embedding-bound. <code>cosine</code> is used rather than <code>l2</code> because vectors are normalized on insert under cosine, which keeps distances comparable if the model is later swapped for another normalized model.</p>

            <p><code>embed_model</code> is not optional bookkeeping. Vectors from two different models are not comparable, and a KNN query spanning both returns confidently wrong neighbours. Any query touching <code>body_vector</code> must be scoped to a single <code>embed_model</code> value until a rebuild completes.</p>

            <h3>7.3 What is deliberately absent</h3>
            <ul>
              <li>No <code>summary</code> column — summaries are a derived artifact and belong in the bucket, projected in later.</li>
              <li>No <code>pinned</code> or <code>cached</code> column — cache state is machine-local and would violate I-2.</li>
              <li>No <code>relevance_score</code> column — ranking is computed per query, never stored.</li>
            </ul>

            <KeyPoint>Every column here is reconstructible from the bucket, which is what makes dropping and rebuilding the index a routine operation rather than a data-loss event.</KeyPoint>
          </section>

          {/* Section 8 */}
          <section id="s8">
            <h2>8 · Retrieval Contract</h2>
            <Tldr>Three verbs — <code>search</code>, <code>expand</code>, <code>materialize</code> — where only the third touches a bucket, and every response states its cost so an agent can decide to stop.</Tldr>

            <h3>8.1 search — no bucket call</h3>
            <CodeBlock lang="sql">{`SELECT segment_id, session_id, ref_kind, seq, object_id,
       byte_start, byte_len, token_estimate,
       WEIGHT() AS score
FROM segment
WHERE MATCH('galera replication failure')
  AND project = 'agent-history'
  AND harness IN ('claude-code', 'codex-cli')
  AND created_at > UNIX_TIMESTAMP('2026-08-01 00:00:00')
  AND embed_model = 'Xenova/all-MiniLM-L6-v2'
ORDER BY score DESC
LIMIT 20
FACET logical_category
FACET harness
FACET ref_kind;`}</CodeBlock>

            <p>Relevance is <code>WEIGHT()</code>. The facet blocks are the progressive-disclosure primitive: the agent receives twenty hits plus counts across categories and harnesses, and can narrow without a second full query.</p>

            <h3>8.2 Hybrid search</h3>
            <p>Where a query has both a precise term and a fuzzy intent, <code>hybrid_match()</code> runs the lexical and KNN paths from one query string against a table whose <code>float_vector</code> has auto-embeddings configured. It replaces the naive <code>MATCH(...) OR knn(...)</code> construction, which is not valid Manticore and cannot fuse the two score distributions.</p>

            <CodeBlock lang="sql">{`SELECT segment_id, session_id, byte_start, byte_len, token_estimate
FROM segment
WHERE hybrid_match('the oauth flow that kept 401-ing after refresh')
  AND project = 'agent-history'
LIMIT 10;`}</CodeBlock>

            <h3>8.3 expand — still no bucket call</h3>
            <CodeBlock lang="sql">{`SELECT segment_id, seq, ref_kind, body_text, token_estimate
FROM segment
WHERE session_id = 'ses_01JQ8Z…'
  AND seq BETWEEN 47 AND 53
ORDER BY seq ASC;`}</CodeBlock>

            <p><code>expand(segment_id, depth)</code> resolves to a <code>seq</code> window around the hit. Because <code>body_text</code> is the stripped projection, a seven-message neighbourhood typically costs a few thousand tokens rather than the tens of thousands the original payloads would.</p>

            <h3>8.4 materialize — the only bucket call</h3>
            <CodeBlock lang="http">{`GET  objects/41/8b/418b03fd97ae…12a
Range: bytes=17482210-17499761

→ 17,552 bytes
→ verify: sha256 of full object matches catalog.content_hash on first fetch
→ parse: whole JSONL lines, no reassembly`}</CodeBlock>

            <h3>Three verbs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sky-400 font-mono font-bold text-sm mb-1">search</div>
                <div className="text-slate-400 text-sm">hits + cost</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sky-400 font-mono font-bold text-sm mb-1">expand</div>
                <div className="text-slate-400 text-sm">wider projection</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-sky-400 font-mono font-bold text-sm mb-1">materialize</div>
                <div className="text-slate-400 text-sm">bytes</div>
              </div>
            </div>

            <p>Each step is a decision point. Cost is visible before it is paid.</p>

            <h3>Seven verbs — rejected</h3>
            <p><code>inspect</code> is <code>search</code> with a filter. <code>fetch_segment</code> is <code>expand</code> at max depth. <code>pin</code> and <code>release</code> are cache policy, not agent concerns.</p>
            <p>A wide surface trains agents to call the heaviest verb by default.</p>

            <KeyPoint>Progressive disclosure must be enforced by the shape of the API, because an agent offered a one-call shortcut to the full object will always take it.</KeyPoint>
          </section>

          {/* Section 9 */}
          <section id="s9">
            <h2>9 · Reprojection</h2>
            <Tldr>Changing the segmentation algorithm, the embedding model, or the schema is a rebuild from the bucket, never a migration of the index.</Tldr>

            <CodeBlock lang="text">{`bucket (immutable)
   │
   ├─ raw captures ─────────┐
   └─ canonical JSONL ──────┤
                            ▼
                     segmentation pass
                            │
                            ▼
                   catalog + segment rows
                            │
                            ▼
                  Manticore RT tables ◄── droppable`}</CodeBlock>

            <h3>Rebuild triggers</h3>
            <table className="doc-table">
              <thead>
                <tr><th>Change</th><th>Scope</th><th>Mechanism</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>New embedding model</td>
                  <td>Vectors only</td>
                  <td><code>ALTER TABLE segment REBUILD EMBEDDINGS body_vector</code>, then flip <code>embed_model</code>. Not available on replicated tables.</td>
                </tr>
                <tr>
                  <td>New segmentation policy</td>
                  <td>All segment rows</td>
                  <td>Full re-segmentation from canonical objects into a shadow table, then atomic swap.</td>
                </tr>
                <tr>
                  <td>Schema change</td>
                  <td>Table definition</td>
                  <td>Create new table, reproject, swap. No in-place <code>ALTER</code> on the live table.</td>
                </tr>
                <tr>
                  <td>Canonical format change</td>
                  <td>Objects too</td>
                  <td>New canonical objects written; old ones retained. Offsets never rewritten in place.</td>
                </tr>
              </tbody>
            </table>

            <p><strong>Bulk-ingest option.</strong> The manual documents adding a model-backed <code>float_vector</code> column <em>after</em> loading, via <code>ALTER TABLE … ADD COLUMN</code>, which generates embeddings for existing rows during the <code>ALTER</code>. For the initial corpus load this is materially faster than embedding inline on insert, at the cost of the table not being semantically searchable until the <code>ALTER</code> finishes. Use it for the first backfill; use inline embedding for steady-state ingest.</p>

            <h3>Analytical projection — deferred</h3>
            <p>Parquet and DuckDB are a second derived consumer of the same canonical objects. They are correct architecturally and premature operationally: they add a reprojection target before the first one is proven. Deferred to P4, with the constraint recorded now that any analytical projection reads canonical objects directly and never reads Manticore.</p>

            <KeyPoint>Because derived representations always change, the ability to throw the index away cheaply is the feature — not the fallback.</KeyPoint>
          </section>

          {/* Section 10 */}
          <section id="s10">
            <h2>10 · Redaction & Tombstones</h2>
            <Tldr>Immutability applies to bytes, not to their continued existence — canonical identity and the audit record survive a purge that removes the bytes from every replica.</Tldr>

            <p>A tool output will eventually contain a live API key, a client's personal data, or something a client contractually requires destroyed. An immutable, dual-replicated, fully audited store with no deletion path cannot satisfy that, and the audit trail makes it worse: the manifest proves the object existed. This has to be designed in now; retrofitting deletion into a content-addressed store is brutal.</p>

            <h3>Lifecycle states</h3>
            <table className="doc-table">
              <thead>
                <tr><th>State</th><th>Bytes</th><th>Catalog row</th><th>Segments</th><th>Reversible</th></tr>
              </thead>
              <tbody>
                <tr><td className="text-emerald-400 font-semibold">active</td><td>Present, verified</td><td>Full</td><td>Indexed</td><td>—</td></tr>
                <tr><td className="text-amber-400 font-semibold">tombstoned</td><td>Present</td><td>Full</td><td>Removed from <code>segment</code></td><td>Yes — reproject</td></tr>
                <tr><td className="text-red-400 font-semibold">purged</td><td>Deleted from every replica</td><td>Identity + provenance only</td><td>Removed</td><td>No</td></tr>
              </tbody>
            </table>

            <h3>Purge procedure</h3>
            <CodeBlock lang="text">{`1. mark      catalog.lifecycle = 'tombstoned'
2. delete    segment rows WHERE object_id = obj_…
3. delete    bytes from every replica, in placement order
4. verify    range GET returns 404 on each replica
5. mark      catalog.lifecycle = 'purged'
6. append    manifest event:
               kind: purge
               object_id: obj_…
               content_hash: sha256:9f2ca7…   # retained
               reason: credential_exposure
               actor: mike
               purged_at: 2026-09-05T19:41:02Z
               replicas_confirmed: [r2, b2]`}</CodeBlock>

            <p>The hash is retained deliberately. It lets a later integrity sweep prove that a missing object was purged by policy rather than lost to corruption — the distinction the whole auditability claim rests on. What is destroyed is the content; what survives is the fact that content existed and was deliberately removed.</p>

            <p>A purge that removes bytes without invalidating segments leaves live byte offsets pointing at nothing. Step 2 precedes step 3 for exactly this reason, and the order is not an implementation preference.</p>

            <h3>Redaction as re-canonicalization</h3>
            <p>Where only part of an object must go — one leaked key in one tool result — the correct operation is not editing bytes. Write a new canonical object with the value replaced by a redaction marker, register it as a new <code>object_id</code>, re-segment the session onto it, then purge the original. The session keeps its identity; the offsets are new because the object is new.</p>

            <KeyPoint>Redaction is never an edit, it is a new object plus a purge — which is why content addressing makes deletion tractable rather than impossible.</KeyPoint>
          </section>

          {/* Section 11 */}
          <section id="s11">
            <h2>11 · Adapter Interfaces</h2>
            <Tldr>Five seams, five interfaces, all in <code>src/types/</code> and barrel-exported — capture, storage, index, embedding, retrieval.</Tldr>

            <CodeBlock lang="typescript">{`// src/types/adapters.ts

export type Provider = "anthropic" | "openai" | "google";
export type Harness  = "claude-code" | "codex-cli" | "gemini-cli" | "pi-code";
export type RefKind  = "message" | "tool_event" | "artifact_ref" | "span";
export type Lifecycle = "active" | "tombstoned" | "purged";

export interface ObjectRef {
  readonly objectId: string;
  readonly contentHash: string;
  readonly sizeBytes: bigint;
  readonly rangeAddressable: boolean;
}

export interface ByteRange {
  readonly start: bigint;
  readonly len: bigint;
}

/** 1. CAPTURE — provider/harness output to canonical records. */
export interface CaptureAdapter {
  readonly harness: Harness;
  readonly provider: Provider;
  detect(path: string): Promise<boolean>;
  normalize(raw: Readable): AsyncIterable<CanonicalRecord>;
}

/** 2. STORAGE — content-addressed blobs. Range reads are mandatory. */
export interface StorageAdapter {
  readonly id: "r2" | "b2" | "s3" | "minio" | "fs";
  put(hash: string, body: Readable): Promise<ObjectRef>;
  getRange(hash: string, range: ByteRange): Promise<Uint8Array>;
  head(hash: string): Promise<ObjectRef | null>;
  verify(hash: string): Promise<boolean>;
  purge(hash: string): Promise<void>;
}

/** 3. INDEX — the search projection. Droppable by contract. */
export interface IndexAdapter {
  readonly id: "manticore";
  upsertSegments(rows: readonly SegmentRow[]): Promise<void>;
  deleteByObject(objectId: string): Promise<number>;
  search(q: SearchQuery): Promise<SearchResult>;
  expand(segmentId: string, depth: number): Promise<readonly SegmentRow[]>;
  drop(): Promise<void>;
}

/** 4. EMBEDDING — declared, not invoked, when auto-embeddings are on. */
export interface EmbeddingAdapter {
  readonly modelName: string;
  readonly dims: number;
  readonly normalized: boolean;
}

/** 5. RETRIEVAL — the agent-facing surface. Three verbs. */
export interface RetrievalAdapter {
  search(q: SearchQuery): Promise<SearchResult>;
  expand(segmentId: string, depth: number): Promise<ExpandResult>;
  materialize(objectId: string, range?: ByteRange): Promise<MaterializeResult>;
}`}</CodeBlock>

            <h3>Resolver behaviour</h3>
            <p>The storage resolver selects among verified replicas by health, then latency, then cost, and retries with exponential backoff and jitter across a minimum of three attempts before failing over to the next provider. A <code>divergent</code> replica is never a candidate. Failures surface as typed errors — <code>ObjectPurgedError</code>, <code>RangeNotAddressableError</code>, <code>ReplicaDivergentError</code> — never as a swallowed exception or a null return.</p>

            <KeyPoint>Five interfaces are the whole replaceability story: every vendor in this architecture sits behind exactly one of them.</KeyPoint>
          </section>

          {/* Section 12 */}
          <section id="s12">
            <h2>12 · Topology & Cache</h2>
            <Tldr>Every machine carries the complete catalog and a partial searchable projection, because a machine that cannot prove absence cannot be trusted to answer a query.</Tldr>

            <h3>Projection policy</h3>
            <table className="doc-table">
              <thead>
                <tr><th>Machine</th><th>catalog</th><th>segment (text + vectors)</th><th>Cache</th></tr>
              </thead>
              <tbody>
                <tr><td className="font-semibold text-white">Server</td><td>Complete</td><td>Complete</td><td>Large</td></tr>
                <tr><td className="font-semibold text-white">Workstation</td><td>Complete</td><td>Active projects</td><td>Medium</td></tr>
                <tr><td className="font-semibold text-white">Laptop</td><td>Complete</td><td>Last 90 days</td><td>Small</td></tr>
                <tr><td className="font-semibold text-white">Cloud worker</td><td>Complete</td><td>None — remote query</td><td>Ephemeral</td></tr>
              </tbody>
            </table>

            <p>The catalog is tier-one data by the system's own economics: identity, provenance, timestamps, hashes, and locators are tiny relative to text and vectors. Replicating it everywhere costs little and buys the property that <code>resolve(ses_…)</code> returns the same answer on every machine. When a local <code>segment</code> projection lacks a session, the result is an explicit <code>projection_miss</code> that routes to the server — never an empty result set that looks like absence.</p>

            <h3>Materialization cache</h3>
            <p>Cache invalidation is free here and that is not an accident. Objects are content-addressed and immutable, so a cached blob keyed by <code>content_hash</code> can never be stale; it can only be evicted. Eviction is LRU with a byte ceiling, and a purge event broadcasts a hash-keyed eviction to every machine.</p>

            <p><strong>Cost note.</strong> Range GETs bill per operation, not only per byte. A thousand small segment fetches is a thousand Class B operations. The local cache is therefore not an optimization layer — it is what makes fine-grained retrieval economically viable at all, and cache hit rate is a first-class metric rather than a nice-to-have.</p>

            <KeyPoint>A partial index must report a miss as a miss, or selective projection quietly reintroduces the siloing this system exists to eliminate.</KeyPoint>
          </section>

          {/* Section 13 */}
          <section id="s13">
            <h2>13 · Validation Gates</h2>
            <Tldr>Nine gates, each mechanically checkable, and none of them satisfiable by a stub.</Tldr>

            <table className="doc-table">
              <thead>
                <tr><th style={{ width: '3rem' }}></th><th>Gate</th><th>Check</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-1</td>
                  <td className="font-semibold text-white">Round-trip fidelity</td>
                  <td>Canonical object → segments → range fetch each segment → reassembled bytes equal the original object byte-for-byte.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-2</td>
                  <td className="font-semibold text-white">Deterministic serialization</td>
                  <td>Re-normalizing the same capture twice yields an identical <code>content_hash</code>.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-3</td>
                  <td className="font-semibold text-white">Offset boundary safety</td>
                  <td>Every <code>byte_start</code> and <code>byte_start + byte_len</code> lands on a UTF-8 boundary across a corpus containing emoji, CJK, and combining marks.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-4</td>
                  <td className="font-semibold text-white">Index rebuildability</td>
                  <td><code>DROP</code> both tables, reproject from the bucket, and every segment row matches the pre-drop state.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-5</td>
                  <td className="font-semibold text-white">Replica byte-equality</td>
                  <td>Independently hashed R2 and B2 copies match; ETags are not accepted as evidence.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-6</td>
                  <td className="font-semibold text-white">Purge completeness</td>
                  <td>After purge, a range GET 404s on every replica, zero segment rows remain, and the manifest event is present.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-7</td>
                  <td className="font-semibold text-white">Model isolation</td>
                  <td>A KNN query spanning two <code>embed_model</code> values is rejected rather than silently answered.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-8</td>
                  <td className="font-semibold text-white">Miss reporting</td>
                  <td>A partial projection returns <code>projection_miss</code>, never an empty result, for a session it does not hold.</td>
                </tr>
                <tr>
                  <td className="font-mono text-sky-400 font-bold">G-9</td>
                  <td className="font-semibold text-white">Token accounting</td>
                  <td>Reported <code>token_estimate</code> is within 10% of the tokenizer's count on a 500-segment sample.</td>
                </tr>
              </tbody>
            </table>

            <p>G-1 is the gate that matters most. It is the single test that proves the byte index is real: if segments cannot reassemble into the original object, every offset in the system is suspect and no downstream result can be trusted.</p>

            <KeyPoint>The byte index either round-trips exactly or it does not exist, and there is no partially-correct state between those two.</KeyPoint>
          </section>

          {/* Appendix */}
          <section id="appendix">
            <h2>A · Taxonomy Lock v2</h2>
            <Tldr>P0's lock is carried forward verbatim and extended with the storage and segment terms introduced here; drift observed during drafting is resolved rather than left ambiguous.</Tldr>

            <h3>Carried forward from P0 — unchanged</h3>
            <table className="doc-table">
              <thead>
                <tr><th>Canonical term</th><th>Used for</th><th>Variants seen — do not use</th></tr>
              </thead>
              <tbody>
                <tr><td className="font-mono text-sky-300">pi-code</td><td>Provider directory, adapter directory, corpus name</td><td><code>providers/pi/</code>, <code>Pi</code> in prose</td></tr>
                <tr><td className="font-mono text-sky-300">history capture pi</td><td>CLI verb only — the CLI token stays short</td><td><code>history capture pi-code</code></td></tr>
                <tr><td className="font-mono text-sky-300">provider</td><td>anthropic, openai, google — the model vendor</td><td>using provider to mean the CLI</td></tr>
                <tr><td className="font-mono text-sky-300">harness</td><td>claude-code, codex-cli, gemini-cli, pi-code</td><td>collapsing harness into provider</td></tr>
                <tr><td className="font-mono text-sky-300">raw / canonical / markdown</td><td>L1 / L2 / L3 directory names inside a provider</td><td>archive, normalized, clean</td></tr>
                <tr><td className="font-mono text-sky-300">shared/corpus/</td><td>The materialized federation (L5)</td><td>merged, global, unified</td></tr>
                <tr><td className="font-mono text-sky-300">organization/current/</td><td>Normative, presently-believed state</td><td>truth, master, latest</td></tr>
                <tr><td className="font-mono text-sky-300">context pack / ctx_</td><td>Assembled continuation state (L7)</td><td>bundle, payload, briefing</td></tr>
                <tr><td className="font-mono text-sky-300">EXECUTION / EVIDENCE / KNOWLEDGE / CONTEXT</td><td>The four planes, in that order</td><td>renaming or reordering planes</td></tr>
                <tr><td className="font-mono text-sky-300">P0–P8</td><td>Implementation packages</td><td>phases, milestones, sprints</td></tr>
              </tbody>
            </table>

            <h3>New in P1</h3>
            <table className="doc-table">
              <thead>
                <tr><th>Canonical term</th><th>Used for</th><th>Variants seen — do not use</th></tr>
              </thead>
              <tbody>
                <tr><td className="font-mono text-sky-300">object / obj_</td><td>A content-addressed blob in a bucket</td><td>blob, file, artifact (artifact is a distinct entity)</td></tr>
                <tr><td className="font-mono text-sky-300">segment / seg_</td><td>An addressable slice: byte range + text range + locator</td><td>chunk, span (span is a <em>sub</em>-segment <code>ref_kind</code> only), shard</td></tr>
                <tr><td className="font-mono text-sky-300">content_hash</td><td>sha256 of the exact stored bytes</td><td>etag, checksum, digest</td></tr>
                <tr><td className="font-mono text-sky-300">byte_start / byte_len</td><td>Byte address of a segment within an object</td><td><code>byte_end</code>, offset, position</td></tr>
                <tr><td className="font-mono text-sky-300">catalog</td><td>The knowledge-of-existence table</td><td>registry, manifest (manifest is the durable bucket-side record)</td></tr>
                <tr><td className="font-mono text-sky-300">materialize</td><td>The only verb that fetches bytes</td><td>fetch, download, hydrate, pull</td></tr>
                <tr><td className="font-mono text-sky-300">projection_miss</td><td>Machine lacks the searchable representation</td><td>not found, no results, empty</td></tr>
                <tr><td className="font-mono text-sky-300">lifecycle</td><td>active / tombstoned / purged</td><td>status, state, deleted flag</td></tr>
              </tbody>
            </table>

            <h3>Drift resolved</h3>
            <p>An architecture draft produced the record <code>provider: claude-code</code>, <code>harness: pi-code</code>. This inverts the P0 lock and is void. The correct form is <code>provider: anthropic</code>, <code>harness: claude-code</code>. Any document, schema, or fixture carrying the inverted form is non-conformant and must be corrected before it is referenced.</p>

            <KeyPoint>Taxonomy drift entered this system through a sample record rather than a definition, which is precisely how it always enters.</KeyPoint>
          </section>

          {/* Next artifact */}
          <section className="mt-16 mb-8 p-6 bg-gradient-to-r from-sky-950/30 to-indigo-950/30 border border-sky-800/30 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Next Artifact: P2 — Context Assembly & Ranking Contract</h3>
            <p className="text-slate-300 mb-4">P1 makes a segment addressable. P2 decides which segments a resuming agent actually receives: ranking policy across lexical and semantic scores, budget allocation against a token ceiling, neighbourhood expansion rules, deduplication across harnesses, and the context-pack serialization an agent consumes.</p>
            <div className="text-sm text-slate-400">
              <p className="font-semibold text-slate-300 mb-2">Build order stays fixed:</p>
              <p className="mb-3">taxonomy → data shape → schema → specification → implementation</p>
              <p className="font-semibold text-slate-300 mb-2">Open decisions carried into P2:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code>logical_category</code> — controlled vocabulary or derived?</li>
                <li>Manticore host placement and its latency budget to R2</li>
                <li>Sub-segment threshold for long assistant messages</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-600">
          <p>LEVERAGEAI · AGENT-HISTORY · Package P1 · DRAFT 2026-09-05</p>
        </footer>
      </main>
    </div>
  );
}
