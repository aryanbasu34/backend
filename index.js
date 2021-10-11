const express = require("express");
const app=express();
const firebase=require("firebase");
const fs = require("fs")
const PDFDocument = require("pdfkit");
const objectstocsv = require('objects-to-csv');
const { randomUUID } = require("crypto");
const config = {
    apiKey: "AIzaSyCqx_MVl0clBGV4NVDmVq7egSJSHZFAES0",
    authDomain: "ps14-da3a1.firebaseapp.com",
    projectId: "ps14-da3a1",
    storageBucket: "ps14-da3a1.appspot.com",
    messagingSenderId: "474011809198",
    appId: "1:474011809198:web:21f4b977ddf545196f843f",
    measurementId: "G-ZG0DWW4WMJ"
  };
  firebase.initializeApp(config);
  const auth = firebase.auth();
 const firestore = firebase.firestore();
console.log("Server is running...")
var today = new Date();
var year = today.getFullYear();
var mes = today.getMonth()+1;
var dia = today.getDate();
var fecha =dia+"-"+mes+"-"+year;
const daydata=[];
const tempdata=[];
const tempgenralinfo=[];

 app.get('/downloadxlx',async(req,res) => {

 csv =  await new objectstocsv(daydata);

await csv.toDisk(`./${fecha} report.csv`);




  
 


  await res.download(`./${fecha} report.csv`,() => {
   
    fs.unlinkSync(`./${fecha} report.csv`)

  })
  
  });
  app.get('/downloadinvoice',async(req,res) => {
 
    createInvoice(tempgenralinfo,tempdata,res)
    

    });
   

const port=process.env.PORT||5000






app.listen(port,()=>{
  firebase.database().ref('temp/foodinfo').on('value', (snapshot) => {
    tempdata.push(snapshot.val());
  })
  firebase.database().ref('temp/generalinfo').on('value', (snapshot) => {
    tempgenralinfo.push(snapshot.val());
    console.log(tempdata[0][0].Dish);
  })

  firebase.database().ref(`coustmers/${fecha}`).orderByChild("genralinfo").on("value", function(snapshot) {
    snapshot.forEach(snap=>{
      daydata.push({Name:snap.val().genralinfo.Name,Phone:snap.val().genralinfo.Phone,SeatNumber:snap.val().genralinfo.SeatNumber,Payement:snap.val().genralinfo.Payement,TotalPrice:snap.val().genralinfo.Totalprice});
  // More code but we don't need to see it here
    })
  })

  console.log(`listening to the port number at ${port}`);
})





function  createInvoice(tempgenralinfo,tempdata,path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  // console.log(invoice);
   //console.log(snapshot.val());
   //console.log(foodinfo.length);
//console.log(foodinfo);

  //console.log(foodinfo.length);

  generateHeader(doc);
  generateCustomerInformation(doc, tempgenralinfo);
  generateInvoiceTable(doc, tempdata);
  generateFooter(doc);

  doc.end();
  doc.pipe(path);
}

function generateHeader(doc) {
//console.log(foodinfo);
  doc
  .image("logo.jpg", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Annpurna Inc.", 110, 57)
    .fontSize(10)
    .text("Annpurna Inc.", 200, 50, { align: "right" })
    .text(" Main Street lahurabir", 200, 65, { align: "right" })
    .text("Varanasi 221001", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, tempgenralinfo) {
 
  //console.log(tempgenralinfo[0].Name);
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(1234, 150, customerInformationTop)
   // .text(  customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
     .text(formatDate(new Date()), 150, customerInformationTop + 15)
     .text("Balance Due:", 50, customerInformationTop + 30)
     .text(
       tempgenralinfo[0].Totalprice+" Rs",
       150,
       customerInformationTop + 30
     )

    .font("Helvetica-Bold")
    .text(tempgenralinfo[0].Name, 300, customerInformationTop)
    .font("Helvetica")
   // .text(invoice.shipping.address, 300, customerInformationTop + 15)
    /*.text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.state +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30 
    ) */
    //.moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, tempdata) {
  let i;
  console.log(tempdata);
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");
var sum=0;
  for (i = 0; i < tempdata[0].length; i++) {
    const item = tempdata[0][i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.Dish,
      'A Dish by Annpurna',
      item.perunitprice+" Rs",
      item.quantity,
      item.cost+" Rs"
    );
sum=sum+item.cost;
    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Total",
    "",
    sum+" Rs"
  );

  const paidToDatePosition = 0;
 /* generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    "",
    //formatCurrency(invoice.paid)
  );

 /* const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Balance Due",
    "",
    //formatCurrency(invoice.subtotal - invoice.paid)
  ); */
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}
