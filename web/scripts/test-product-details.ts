import assert from 'node:assert/strict';
import {Prisma} from '../src/generated/prisma/client';
import {locales} from '../src/lib/i18n';
import {productDetailCopy} from '../src/lib/product-detail-copy';
import {filledRows,positiveValue,hasHanoiStock,verifiedSupplement,productDetailView} from '../src/lib/product-detail-view';
import {verifiedProductData} from '../src/lib/verified-product-data';
import {getProduct,getRelatedProducts,type ProductDetail} from '../src/lib/product-details';
import {prisma} from '../src/lib/prisma';
import {referencePackaging,referencePackagingRows} from '../src/lib/product-reference-images';

// Synthetic values exist only in this process; this test never writes database rows.
const fixture:ProductDetail={
  id:'test-product',slug:'test-only',partNumber:'TEST-ONLY',nameVi:'Sản phẩm thử',nameEn:'Test product',nameZh:'测试产品',
  descriptionVi:null,descriptionEn:null,descriptionZh:null,axle:'FRONT',side:'NA',category:null,seoDescription:null,
  netWeightKg:null,grossWeightKg:null,piecesPerCarton:null,cartonLengthCm:null,cartonWidthCm:null,cartonHeightCm:null,
  images:[],inventory:[{quantity:3,reservedQuantity:3}],oeNumbers:[{oeNumber:{number:'TEST-OEM'}},{oeNumber:{number:'TEST-OEM'}}],
  fitments:[{id:'fitment-a',vehicleVariant:{id:'variant-a',modelCode:null,yearFrom:2014,yearTo:null,vehicleModel:{name:'Test model',brand:{name:'Test brand'}}}}],
};

async function run(){
  assert.deepEqual(filledRows([['empty',null],['blank',' '],['dash','—'],['unknown','Unknown'],['na','N/A'],['value','verified']]),[{label:'value',value:'verified'}]);
  for(const value of [null,undefined,'',NaN,Infinity,-1,0])assert.equal(positiveValue(value,'mm'),null);
  assert.equal(positiveValue(new Prisma.Decimal('4.800'),'kg'),'4.8 kg');
  assert.equal(hasHanoiStock([{quantity:3,reservedQuantity:3}]),false);
  assert.equal(hasHanoiStock([{quantity:3,reservedQuantity:1}]),true);
  assert.equal(hasHanoiStock([{quantity:3,reservedQuantity:1}],true),false);
  assert.equal(verifiedSupplement({source:' ',technical:{strokeMm:999}}),undefined);
  assert.deepEqual(referencePackagingRows(productDetailCopy('en'),false),[],'Unverified reference values must not appear in the production view.');
  for(const locale of locales){
    const t=productDetailCopy(locale),view=productDetailView(fixture,locale);
    assert.equal(view.technical.length,0);assert.equal(view.packaging.length,0);
    assert.ok(!view.information.some(row=>row.label===t.unit||row.label===t.productType||row.label===t.generation));
    assert.deepEqual(view.oem,['TEST-OEM']);assert.equal(view.fitments[0].engine,null);
    assert.ok(!JSON.stringify(view).includes('reservedQuantity'));
    for(const value of Object.values(t))assert.ok(value.trim().length);
  }
  verifiedProductData[fixture.partNumber]={source:'TEST FIXTURE ONLY',technical:{strokeMm:180,upperMount:'N/A'},unit:'PCS',piecesPerBox:1,enginesByVariant:{'variant-a':'Test engine'}};
  try{
    const view=productDetailView({...fixture,netWeightKg:new Prisma.Decimal('4.8'),cartonLengthCm:new Prisma.Decimal(60)},'en');
    assert.ok(view.technical.some(row=>row.label==='Stroke'&&row.value==='180 mm'));
    assert.ok(!view.technical.some(row=>row.label==='Upper Mount'));
    assert.ok(!view.packaging.some(row=>row.label==='Carton Size')); // Partial dimensions cannot form a carton size.
    assert.equal(view.fitments[0].engine,'Test engine');
    assert.ok(view.information.some(row=>row.label==='Unit'&&row.value==='PCS'));
  }finally{delete verifiedProductData[fixture.partNumber];}
  console.log('PASS: sparse data, source requirement, OEM deduplication, quantities kept private, units and six languages');
  if(!process.env.DATABASE_URL)return;
  try{
    const record=await prisma.product.findFirst({where:{status:'ACTIVE'},select:{slug:true}});
    assert.ok(record,'An existing active product is needed for read-only integration checks.');
    const p=await getProduct(record.slug);assert.ok(p);
    const related=await getRelatedProducts(p);
    assert.ok(related.length<=3,'Related products must fit the requested three-card row.');
    for(const item of related){
      assert.notEqual(item.id,p.id);
      const relation=await prisma.productFitment.findFirst({where:{productId:item.id,vehicleVariantId:{in:p.fitments.map(f=>f.vehicleVariant.id)}}});
      assert.ok(relation,'Related products must share a real variant.');
    }
    const base=process.env.CATALOG_TEST_URL||'http://127.0.0.1:3006';
    for(const locale of locales){
      const response:Response=await fetch(`${base}/${locale}/products/${p.slug}`);assert.equal(response.status,200);
      const html=await response.text();const t=productDetailCopy(locale);
      assert.ok(html.includes(t.requestQuote));assert.ok(!html.includes('id="product-information"'));
      assert.ok(html.includes(p.partNumber));assert.match(html,/<title>[^<]*NEVERSTOP<\/title>/);
      for(const field of ['retailPrice1','retailPrice2','reservedQuantity','storeStock','warehouseStock'])assert.ok(!html.includes(field),`Internal field exposed: ${field}`);
      const view=productDetailView(p,locale);
      if(!view.technical.length)assert.ok(!html.includes('id="technical-data"'));
      if(!view.packaging.length&&!view.packagingImages.length&&!referencePackaging(p.partNumber).length)assert.ok(!html.includes('id="packaging-logistics"'));
      if(!view.packaging.length&&html.includes('68 × 21 × 21')){
        assert.ok(html.includes('data-reference-example="true"'),'Reference values must be marked as preview examples.');
        assert.ok(html.includes(t.packagingExample),'Reference values must have a visible localized disclaimer.');
        assert.equal(view.packaging.length,0,'Preview examples must not become verified product data.');
      }
    }
    const checks:Record<string,string>[]=[{q:p.partNumber},...(p.oeNumbers[0]?[{q:p.oeNumbers[0].oeNumber.number}]:[]),...(p.fitments[0]?[{variantId:p.fitments[0].vehicleVariant.id,year:String(p.fitments[0].vehicleVariant.yearFrom)}]:[])];
    for(const query of checks){
      const response=await fetch(`${base}/api/products?${new URLSearchParams(query)}`);assert.equal(response.status,200);
      const result=await response.json();assert.ok(result.data.some((item:{id:string})=>item.id===p.id));
    }
    assert.equal((await fetch(`${base}/en/products/does-not-exist-test`)).status,404);
    console.log('PASS: six detail routes, SEO, private-field exclusion, empty sections, real related products, unchanged part/OEM/vehicle queries and 404');
  }finally{await prisma.$disconnect();}
}
run().catch(error=>{console.error(error instanceof assert.AssertionError?error.message:'Product detail checks failed');process.exitCode=1;});
