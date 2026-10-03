"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductResults, VehicleBrand } from "@/lib/catalog-types";

const fieldClass = "w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none focus:border-orange-500 disabled:opacity-40";

export default function VehicleSearch() {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState("");
  const [variantId, setVariantId] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResults | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const searchAbort = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/vehicles", { signal: controller.signal });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error("vehicles");
        setBrands(body.data);
      } catch {
        if (!controller.signal.aborted) setVehicleError(true);
      } finally {
        if (!controller.signal.aborted) setLoadingVehicles(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [retry]);
  useEffect(() => () => searchAbort.current?.abort(), []);

  const models = brands.find((brand) => brand.id === brandId)?.models ?? [];
  const variants = models.find((model) => model.id === modelId)?.variants ?? [];
  const years = [...new Set(variants.flatMap((variant) => {
    const end = variant.yearTo ?? Math.max(new Date().getFullYear(), variant.yearFrom);
    return Array.from({ length: Math.max(0, end - variant.yearFrom + 1) }, (_, index) => variant.yearFrom + index);
  }))].sort((a, b) => b - a);
  const matchingVariants = variants.filter((variant) => year && variant.yearFrom <= Number(year) && (variant.yearTo === null || variant.yearTo >= Number(year)));

  function resetResults() {
    searchAbort.current?.abort();
    setResults(null); setSearchError(false); setSearching(false);
  }

  async function search(params: URLSearchParams) {
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setSearching(true); setSearchError(false); setResults(null);
    setLastSearch(params.toString());
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const response = await fetch("/api/products?" + params.toString(), { signal: controller.signal });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error("products");
      if (!controller.signal.aborted) setResults(body);
    } catch {
      if (!controller.signal.aborted) setSearchError(true);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }

  function changePage(page: number) {
    const params = new URLSearchParams(lastSearch);
    params.set("page", String(page)); void search(params);
  }

  return (<>
    <section id="vehicle-search" className="border-t border-zinc-800 bg-zinc-950 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-bold tracking-[0.22em] text-orange-500">TRA CỨU THEO XE</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">Tìm giảm xóc phù hợp</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">Chọn thông tin xe để kiểm tra sản phẩm phù hợp.</p>
        </div>
        {loadingVehicles && <p role="status" className="mb-4 text-zinc-400">Đang tải thông tin xe…</p>}
        {vehicleError && <div role="alert" className="mb-4 text-orange-400">Không thể tải thông tin xe. <button type="button" className="underline" onClick={() => { setVehicleError(false); setLoadingVehicles(true); setRetry(retry + 1); }}>Thử lại</button></div>}
        {!loadingVehicles && !vehicleError && brands.length === 0 && <p role="status" className="mb-4 text-zinc-400">Chưa có dữ liệu xe.</p>}
        <form onSubmit={(event) => { event.preventDefault(); if (variantId && year) void search(new URLSearchParams({ variantId, year })); }}>
          <div className="grid gap-4 md:grid-cols-4">
            <div><label htmlFor="vehicle-brand" className="mb-2 block text-sm text-zinc-400">Hãng xe</label>
              <select id="vehicle-brand" className={fieldClass} value={brandId} disabled={loadingVehicles || vehicleError} required onChange={(event) => { setBrandId(event.target.value); setModelId(""); setYear(""); setVariantId(""); resetResults(); }}>
                <option value="">Chọn hãng xe</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div><label htmlFor="vehicle-model" className="mb-2 block text-sm text-zinc-400">Dòng xe</label>
              <select id="vehicle-model" className={fieldClass} value={modelId} disabled={!brandId} required onChange={(event) => { setModelId(event.target.value); setYear(""); setVariantId(""); resetResults(); }}>
                <option value="">Chọn dòng xe</option>{models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </div>
            <div><label htmlFor="vehicle-year" className="mb-2 block text-sm text-zinc-400">Năm sản xuất</label>
              <select id="vehicle-year" className={fieldClass} value={year} disabled={!modelId} required onChange={(event) => { setYear(event.target.value); setVariantId(""); resetResults(); }}>
                <option value="">Chọn năm</option>{years.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div><label htmlFor="vehicle-variant" className="mb-2 block text-sm text-zinc-400">Mã xe</label>
              <select id="vehicle-variant" className={fieldClass} value={variantId} disabled={!year} required onChange={(event) => { setVariantId(event.target.value); resetResults(); }}>
                <option value="">Chọn mã xe</option>{matchingVariants.map((variant) => <option key={variant.id} value={variant.id}>{variant.modelCode ?? variant.displayName ?? "Phiên bản"} · {variant.yearFrom}–{variant.yearTo ?? "nay"}</option>)}
              </select>
            </div>
          </div>
          <button disabled={!variantId || !year || searching} className="mt-6 rounded-xl bg-orange-500 px-8 py-4 font-black text-black hover:bg-orange-400 disabled:opacity-40">TÌM SẢN PHẨM</button>
        </form>
        <div id="oe-search" className="mt-12 rounded-2xl border border-zinc-800 bg-black p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] md:items-center">
            <div><p className="text-sm font-bold text-orange-500">TÌM THEO MÃ</p><h3 className="mt-2 text-2xl font-black">OE Number / Part Number</h3><p className="mt-2 text-sm text-zinc-500">Nhập mã OE, mã NEVERSTOP hoặc mã xe.</p></div>
            <form className="flex gap-3" onSubmit={(event) => { event.preventDefault(); if (query.trim()) void search(new URLSearchParams({ q: query.trim() })); }}>
              <input aria-label="OE Number / Part Number" type="search" required maxLength={100} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: 2025-D641-302F / NCP150" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-white outline-none focus:border-orange-500" />
              <button disabled={!query.trim() || searching} className="rounded-xl bg-orange-500 px-6 font-black text-black disabled:opacity-40">Tìm</button>
            </form>
          </div>
        </div>
        <div ref={resultsRef} aria-live="polite" aria-busy={searching} className="scroll-mt-6">
          {searching && <p role="status" className="mt-10 text-zinc-400">Đang tìm sản phẩm…</p>}
          {searchError && <div role="alert" className="mt-10 text-orange-400">Không thể tải sản phẩm. <button className="underline" onClick={() => void search(new URLSearchParams(lastSearch))}>Thử lại</button></div>}
          {results && <div className="mt-10">
            <h3 className="text-2xl font-black">Kết quả tra cứu</h3>
            {results.data.length === 0 ? <p className="mt-4 text-zinc-400">Không tìm thấy sản phẩm phù hợp. Vui lòng kiểm tra thông tin xe hoặc mã sản phẩm.</p> : <div className="mt-6 grid gap-4 md:grid-cols-2">
              {results.data.map((product) => <article key={product.id} className="rounded-2xl border border-zinc-800 bg-black p-6">
                <p className="break-all text-sm font-bold text-orange-500">{product.partNumber}</p><h4 className="mt-3 text-xl font-black">{product.nameVi}</h4>
                <p className="mt-3 text-sm text-zinc-400">{product.axle === "FRONT" ? "Trước" : product.axle === "REAR" ? "Sau" : ""}{product.side === "LEFT" ? " · Trái" : product.side === "RIGHT" ? " · Phải" : product.side === "BOTH" ? " · Hai bên" : ""}</p>
                {product.fitments.map((fitment) => <p key={fitment} className="mt-2 text-sm text-zinc-400">{fitment}</p>)}
                <p className="mt-3 text-sm text-zinc-400">OE: {product.oeNumbers.join(", ") || "Đang cập nhật"}</p>
                <p className="mt-4 text-sm font-bold text-orange-500">{product.availableQuantity > 0 ? "Còn hàng" : "Tạm hết hàng"}</p>
              </article>)}
            </div>}
            {(results.page > 1 || results.hasMore) && <div className="mt-6 flex items-center gap-4"><button disabled={results.page === 1} onClick={() => changePage(results.page - 1)} className="rounded-lg border border-zinc-700 px-4 py-2 disabled:opacity-40">Trước</button><span>Trang {results.page}</span><button disabled={!results.hasMore} onClick={() => changePage(results.page + 1)} className="rounded-lg border border-zinc-700 px-4 py-2 disabled:opacity-40">Tiếp</button></div>}
          </div>}
        </div>
      </div>
    </section>
    <section className="bg-white px-6 py-20 text-black">
      <div className="mx-auto max-w-7xl"><div className="mb-10"><p className="text-sm font-bold tracking-[0.22em] text-orange-500">DÒNG XE PHỔ BIẾN</p><h2 className="mt-3 text-3xl font-black md:text-4xl">Tra cứu nhanh theo dòng xe</h2><p className="mt-3 text-zinc-500">Chọn dòng xe, sau đó chọn năm sản xuất và mã xe.</p></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{brands.flatMap((brand) => brand.models.filter((model) => model.variants.length > 0).map((model) => <button key={model.id} onClick={() => { setBrandId(brand.id); setModelId(model.id); setYear(""); setVariantId(""); resetResults(); document.getElementById("vehicle-search")?.scrollIntoView({ behavior: "smooth" }); }} className="group rounded-2xl border border-zinc-200 bg-white p-6 text-left transition hover:border-orange-500 hover:shadow-lg"><div className="text-xs font-bold tracking-[0.18em] text-zinc-400">VEHICLE</div><div className="mt-8 text-lg font-black">{brand.name} {model.name}</div><div className="mt-3 text-sm font-bold text-orange-500">Chọn năm / mã xe →</div></button>))}</div>
      </div>
    </section>
  </>);
}
