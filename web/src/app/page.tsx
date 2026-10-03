export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-black tracking-[0.22em] text-orange-500">
              NEVERSTOP
            </div>
            <div className="text-[10px] tracking-[0.24em] text-zinc-500">
              AUTO PARTS
            </div>
          </div>

          <nav className="hidden gap-7 text-sm text-zinc-300 md:flex">
            <a href="#" className="hover:text-orange-500">
              Trang chủ
            </a>
            <a href="#" className="hover:text-orange-500">
              Sản phẩm
            </a>
            <a href="#" className="hover:text-orange-500">
              Tra cứu theo xe
            </a>
            <a href="#" className="hover:text-orange-500">
              Liên hệ
            </a>
          </nav>
<div className="hidden items-center gap-2 text-sm md:flex">
  <button className="font-bold text-orange-500">VI</button>
  <span className="text-zinc-700">|</span>
  <button className="text-zinc-400 hover:text-white">EN</button>
  <span className="text-zinc-700">|</span>
  <button className="text-zinc-400 hover:text-white">中文</button>
</div>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black">
            Nhắn Zalo
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-sm font-bold tracking-[0.25em] text-orange-500">
          NEVERSTOP AUTO PARTS
        </p>

        <h1 className="mt-5 text-5xl font-black md:text-6xl">
          Giảm xóc ô tô
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-400">
          Tra cứu theo dòng xe, năm sản xuất, mã xe và OE Number.
        </p>

        <div className="mt-8 flex gap-3">
          <button className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-black">
            Tra cứu giảm xóc
          </button>

          <button className="rounded-lg border border-zinc-700 px-6 py-3 font-bold">
            Liên hệ Zalo
          </button>
        </div>
      </section>
      {/* Vehicle Search */}
<section className="border-t border-zinc-800 bg-zinc-950 px-6 py-20">
  <div className="mx-auto max-w-7xl">
    <div className="mb-10">
      <p className="text-sm font-bold tracking-[0.22em] text-orange-500">
        TRA CỨU THEO XE
      </p>

      <h2 className="mt-3 text-3xl font-black md:text-4xl">
        Tìm giảm xóc phù hợp
      </h2>

      <p className="mt-3 max-w-2xl text-zinc-400">
        Chọn thông tin xe để kiểm tra sản phẩm phù hợp.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Hãng xe
        </label>

        <select className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none">
          <option>Chọn hãng xe</option>
          <option>Toyota</option>
          <option>Hyundai</option>
          <option>Kia</option>
          <option>Mitsubishi</option>
          <option>Ford</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Dòng xe
        </label>

        <select className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none">
          <option>Chọn dòng xe</option>
          <option>Vios</option>
          <option>Innova</option>
          <option>Corolla Cross</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Năm sản xuất
        </label>

        <select className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none">
          <option>Chọn năm</option>
          <option>2014</option>
          <option>2015</option>
          <option>2016</option>
          <option>2017</option>
          <option>2018</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Mã xe
        </label>

        <select className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none">
          <option>Chọn mã xe</option>
          <option>NCP150</option>
          <option>NCP93</option>
        </select>
      </div>
    </div>

    <button className="mt-6 rounded-xl bg-orange-500 px-8 py-4 font-black text-black hover:bg-orange-400">
      TÌM SẢN PHẨM
    </button>

    {/* OE Search */}
    <div className="mt-12 rounded-2xl border border-zinc-800 bg-black p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] md:items-center">
        <div>
          <p className="text-sm font-bold text-orange-500">
            TÌM THEO MÃ
          </p>

          <h3 className="mt-2 text-2xl font-black">
            OE Number / Part Number
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Nhập mã OE, mã NEVERSTOP hoặc mã xe.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ví dụ: 48520-0D040 / 2025-D031-322FL / NCP150"
            className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-white outline-none focus:border-orange-500"
          />

          <button className="rounded-xl bg-orange-500 px-6 font-black text-black">
            Tìm
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Popular Vehicles */}
<section className="bg-white px-6 py-20 text-black">
  <div className="mx-auto max-w-7xl">
    <div className="mb-10">
      <p className="text-sm font-bold tracking-[0.22em] text-orange-500">
        DÒNG XE PHỔ BIẾN
      </p>

      <h2 className="mt-3 text-3xl font-black md:text-4xl">
        Tra cứu nhanh theo dòng xe
      </h2>

      <p className="mt-3 text-zinc-500">
        Chọn dòng xe để xem các mã giảm xóc phù hợp.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[
        "Toyota Vios",
        "Mitsubishi Xpander",
        "Hyundai Grand i10",
        "Hyundai Tucson",
        "Kia K3 / Cerato",
        "Ford Ranger",
        "Toyota Innova",
        "Toyota Corolla Cross",
      ].map((vehicle) => (
        <button
          key={vehicle}
          className="group rounded-2xl border border-zinc-200 bg-white p-6 text-left transition hover:border-orange-500 hover:shadow-lg"
        >
          <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
            VEHICLE
          </div>

          <div className="mt-8 text-lg font-black">
            {vehicle}
          </div>

          <div className="mt-3 text-sm font-bold text-orange-500">
            Xem sản phẩm →
          </div>
        </button>
      ))}
    </div>
  </div>
</section>
{/* Products */}
<section className="bg-zinc-100 px-6 py-20 text-black">
  <div className="mx-auto max-w-7xl">
    <div className="mb-10">
      <p className="text-sm font-bold tracking-[0.22em] text-orange-500">
        SẢN PHẨM
      </p>

      <h2 className="mt-3 text-3xl font-black md:text-4xl">
        Giảm xóc ô tô NEVERSTOP
      </h2>

      <p className="mt-3 max-w-2xl text-zinc-500">
        Tra cứu sản phẩm theo vị trí lắp, dòng xe, OE Number hoặc mã NEVERSTOP.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      <button className="rounded-2xl bg-black p-7 text-left text-white transition hover:-translate-y-1">
        <div className="text-xs font-bold tracking-[0.18em] text-orange-500">
          PRODUCT
        </div>

        <div className="mt-10 text-2xl font-black">
          Shock Absorber
        </div>

        <div className="mt-2 text-sm text-zinc-400">
          Giảm xóc ô tô
        </div>

        <div className="mt-6 font-bold text-orange-500">
          Xem sản phẩm →
        </div>
      </button>

      <button className="rounded-2xl border border-zinc-200 bg-white p-7 text-left transition hover:border-orange-500">
        <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
          POSITION
        </div>

        <div className="mt-10 text-2xl font-black">
          Front
        </div>

        <div className="mt-2 text-sm text-zinc-500">
          Giảm xóc trước
        </div>

        <div className="mt-6 font-bold text-orange-500">
          Tra cứu →
        </div>
      </button>

      <button className="rounded-2xl border border-zinc-200 bg-white p-7 text-left transition hover:border-orange-500">
        <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
          POSITION
        </div>

        <div className="mt-10 text-2xl font-black">
          Rear
        </div>

        <div className="mt-2 text-sm text-zinc-500">
          Giảm xóc sau
        </div>

        <div className="mt-6 font-bold text-orange-500">
          Tra cứu →
        </div>
      </button>

      <button className="rounded-2xl border border-zinc-200 bg-white p-7 text-left transition hover:border-orange-500">
        <div className="text-xs font-bold tracking-[0.18em] text-zinc-400">
          SEARCH
        </div>

        <div className="mt-10 text-2xl font-black">
          OE Number
        </div>

        <div className="mt-2 text-sm text-zinc-500">
          Tra cứu theo mã OE
        </div>

        <div className="mt-6 font-bold text-orange-500">
          Tìm mã →
        </div>
      </button>
    </div>
  </div>
</section>
{/* Why NEVERSTOP */}
<section className="bg-white px-6 py-20 text-black">
  <div className="mx-auto max-w-7xl">
    <div className="mb-12 max-w-3xl">
      <p className="text-sm font-bold tracking-[0.22em] text-orange-500">
        WHY NEVERSTOP
      </p>

      <h2 className="mt-3 text-3xl font-black md:text-4xl">
        Hỗ trợ khách hàng tìm đúng sản phẩm
      </h2>

      <p className="mt-4 leading-7 text-zinc-500">
        NEVERSTOP tập trung vào khả năng tra cứu sản phẩm, hỗ trợ kiểm tra mã
        và cung cấp hàng từ Hà Nội cho khách hàng trên toàn Việt Nam.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-2xl border border-zinc-200 p-7">
        <div className="text-4xl font-black text-orange-500">
          01
        </div>

        <h3 className="mt-6 text-xl font-black">
          Nguồn hàng trực tiếp
        </h3>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Thông tin mã hàng rõ ràng và hệ thống sản phẩm được quản lý tập trung.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-7">
        <div className="text-4xl font-black text-orange-500">
          02
        </div>

        <h3 className="mt-6 text-xl font-black">
          Kho hàng tại Hà Nội
        </h3>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Hỗ trợ kiểm tra tình trạng hàng và xử lý đơn nhanh chóng.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-7">
        <div className="text-4xl font-black text-orange-500">
          03
        </div>

        <h3 className="mt-6 text-xl font-black">
          Hỗ trợ tra đúng mã
        </h3>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Tra cứu theo dòng xe, năm sản xuất, mã xe và OE Number.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-7">
        <div className="text-4xl font-black text-orange-500">
          04
        </div>

        <h3 className="mt-6 text-xl font-black">
          Giao hàng toàn quốc
        </h3>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Hỗ trợ gara, cửa hàng phụ tùng và khách hàng trên toàn Việt Nam.
        </p>
      </div>
    </div>
  </div>
</section>

{/* Contact CTA */}
<section className="bg-orange-500 px-6 py-16 text-black">
  <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm font-bold tracking-[0.18em]">
        CẦN KIỂM TRA MÃ?
      </p>

      <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-4xl">
        Gửi tên xe + năm sản xuất cho NEVERSTOP
      </h2>

      <p className="mt-3 max-w-2xl text-black/70">
        Chúng tôi hỗ trợ kiểm tra mã giảm xóc phù hợp với dòng xe của bạn.
      </p>
    </div>

    <div className="flex flex-wrap gap-3">
      <button className="rounded-xl bg-black px-6 py-4 font-black text-white">
        Nhắn Zalo
      </button>

      <button className="rounded-xl border-2 border-black px-6 py-4 font-black">
        Yêu cầu báo giá
      </button>
    </div>
  </div>
</section>

{/* Footer */}
<footer className="bg-black px-6 py-12 text-zinc-400">
  <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
    <div className="md:col-span-2">
      <div className="text-xl font-black tracking-[0.22em] text-orange-500">
        NEVERSTOP
      </div>

      <div className="mt-1 text-[10px] tracking-[0.25em] text-zinc-600">
        AUTO PARTS
      </div>

      <p className="mt-5 max-w-md text-sm leading-6">
        Giảm xóc và phụ tùng ô tô cho thị trường Việt Nam.
      </p>
    </div>

    <div>
      <div className="font-bold text-white">
        Liên hệ
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>Hà Nội, Việt Nam</p>
        <p>Zalo</p>
        <p>Điện thoại</p>
      </div>
    </div>

    <div>
      <div className="font-bold text-white">
        Hỗ trợ
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p>Tra cứu theo xe</p>
        <p>Tra cứu OE Number</p>
        <p>Yêu cầu báo giá</p>
      </div>
    </div>
  </div>

  <div className="mx-auto mt-10 max-w-7xl border-t border-zinc-800 pt-6 text-xs text-zinc-600">
    © 2026 NEVERSTOP. All rights reserved.
  </div>
</footer>
    </main>
  );
}