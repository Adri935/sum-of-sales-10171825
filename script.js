// Helper function to parse data URLs
function parseDataUrl(url) {
  if (!url.startsWith('data:')) {
    return null;
  }
  
  const commaIndex = url.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid data URL');
  }
  
  const header = url.substring(5, commaIndex);
  const payload = url.substring(commaIndex + 1);
  
  const parts = header.split(';');
  const mime = parts[0] || 'text/plain';
  const isBase64 = parts.includes('base64');
  
  return { mime, isBase64, payload };
}

// Helper function to decode base64 to text
function decodeBase64ToText(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Helper function to parse CSV
function parseCsv(text) {
  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  
  // Detect delimiter
  const delimiters = [',', ';', '\t'];
  let delimiter = ',';
  let maxCount = 0;
  
  for (const delim of delimiters) {
    const count = (text.indexOf('\n') !== -1 ? text.substring(0, text.indexOf('\n')) : text).split(delim).length;
    if (count > maxCount) {
      maxCount = count;
      delimiter = delim;
    }
  }
  
  // Split into lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }
  
  // Determine if first row is header
  const firstRow = lines[0].split(delimiter);
  const isHeader = firstRow.some(cell => isNaN(parseFloat(cell)));
  
  const headers = isHeader ? firstRow.map(cell => cell.trim()) : null;
  const startIndex = isHeader ? 1 : 0;
  
  const rows = [];
  for (let i = startIndex; i < lines.length; i++) {
    // Simple CSV parsing (doesn't handle all edge cases but works for this data)
    const cells = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        if (inQuotes && j + 1 < lines[i].length && lines[i][j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    cells.push(current.trim());
    rows.push(cells);
  }
  
  return { headers, rows };
}

// Main function to process sales data
async function processSalesData() {
  const totalSalesElement = document.getElementById('total-sales');
  
  try {
    // Attachment URL from the specification
    const attachmentUrl = "data:text/csv;base64,UHJvZHVjdHMsU2FsZXMKUGhvbmVzLDEwMDAKQm9va3MsMTIzLjQ1Ck5vdGVib29rcywxMTEuMTEK";
    
    let csvText;
    
    // Check if it's a data URL
    const dataUrlInfo = parseDataUrl(attachmentUrl);
    
    if (dataUrlInfo) {
      if (dataUrlInfo.isBase64) {
        csvText = decodeBase64ToText(dataUrlInfo.payload);
      } else {
        csvText = decodeURIComponent(dataUrlInfo.payload);
      }
    } else {
      // If it's a regular URL, fetch it
      const response = await fetch(attachmentUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      csvText = await response.text();
    }
    
    // Parse CSV
    const { headers, rows } = parseCsv(csvText);
    
    // Find sales column
    let salesColumnIndex = -1;
    
    if (headers) {
      salesColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('sales') || header.toLowerCase().includes('sale')
      );
    }
    
    // If we couldn't find by header name, assume it's the second column (index 1)
    if (salesColumnIndex === -1) {
      salesColumnIndex = 1;
    }
    
    // Calculate total sales
    let totalSales = 0;
    for (const row of rows) {
      if (row.length > salesColumnIndex) {
        const value = parseFloat(row[salesColumnIndex]);
        if (!isNaN(value)) {
          totalSales += value;
        }
      }
    }
    
    // Update the DOM
    totalSalesElement.textContent = totalSales.toFixed(2);
  } catch (error) {
    console.error('Error processing sales data:', error);
    totalSalesElement.textContent = 'Error';
    totalSalesElement.parentElement.innerHTML = `<h2 class="text-danger">Error loading sales data: ${error.message}</h2>`;
  }
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', processSalesData);
