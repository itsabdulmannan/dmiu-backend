const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePdf(data) {
    const { products, totalQuotationValue } = data;

    const productRows = products.map(product => {
        const { productName, productImage, originalPrice, finalPrice, quantity, total, color, weight } = product;
        return `
            <tr>
                <td>${productName}</td>
                <td><img src="${productImage}" alt="Product Image" style="max-width: 100px; max-height: 100px;"></td>
                <td>$${originalPrice}</td>
                <td>${quantity}</td>
                <td>$${total}</td>
                <td>${color}</td>
                <td>${weight}</td>
            </tr>
        `;
    }).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quotation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f4f4f4; }
        </style>
    </head>
    <body>
        <h1>Quotation</h1>
        <table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Color</th>
                    <th>Weight</th>
                </tr>
            </thead>
            <tbody>
                ${productRows}
            </tbody>
        </table>
        <h2>Total Quotation Value: $${totalQuotationValue}</h2>
    </body>
    </html>
    `;

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        const filePath = `/quotation_${Date.now()}.pdf`;
        const fullPath = path.resolve(`'../../public/pdf/${filePath}`);

        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await page.pdf({ path: fullPath, format: 'A4', printBackground: true });
        await browser.close();

        return fullPath;
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        throw new Error('PDF generation failed');
    }
}


module.exports = generatePdf;
