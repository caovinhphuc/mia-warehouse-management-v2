/* eslint-disable */
/**
 * Export Utilities
 * Export analytics data to PDF, Excel, CSV
 */

// Export to PDF (using html2pdf.js or similar)
export const exportToPDF = async (data, filename = "export") => {
  try {
    // For now, we'll use a simple approach with window.print
    // In production, you might want to use jsPDF or html2pdf.js

    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <p>Generated: ${new Date().toLocaleString("vi-VN")}</p>
          <h2>Widgets (${data.widgets.length})</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Data Points</th>
              </tr>
            </thead>
            <tbody>
              ${data.widgets
                .map(
                  (widget) => `
                <tr>
                  <td>${widget.id}</td>
                  <td>${widget.title}</td>
                  <td>${widget.type}</td>
                  <td>${widget.data?.length || 0}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <button onclick="window.print()">Print / Save as PDF</button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);

    return true;
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to export to PDF");
  }
};

// Export to Excel (using SheetJS or similar)
export const exportToExcel = async (data, filename = "export") => {
  try {
    // Simple CSV approach for now
    // In production, use xlsx library for proper Excel format

    let csvContent = "ID,Title,Type,Data Points\n";
    data.widgets.forEach((widget) => {
      csvContent += `${widget.id},"${widget.title}",${widget.type},${widget.data?.length || 0}\n`;
    });

    // Convert to Excel-like format
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    throw new Error("Failed to export to Excel");
  }
};

// Export to CSV
export const exportToCSV = async (data, filename = "export") => {
  try {
    let csvContent = "";

    // Header
    csvContent += "Dashboard Export\n";
    csvContent += `Generated: ${new Date().toLocaleString("vi-VN")}\n`;
    csvContent += "\n";

    // Widgets summary
    csvContent += "Widgets\n";
    csvContent += "ID,Title,Type,Data Points\n";
    data.widgets.forEach((widget) => {
      csvContent += `${widget.id},"${widget.title}",${widget.type},${widget.data?.length || 0}\n`;
    });

    csvContent += "\n";

    // Widget data
    data.widgets.forEach((widget, index) => {
      csvContent += `\nWidget ${index + 1}: ${widget.title} (${widget.type})\n`;
      if (widget.data && widget.data.length > 0) {
        const headers = Object.keys(widget.data[0]).join(",");
        csvContent += `${headers}\n`;
        widget.data.forEach((row) => {
          const values = Object.values(row)
            .map((val) => (typeof val === "string" ? `"${val}"` : val))
            .join(",");
          csvContent += `${values}\n`;
        });
      }
    });

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("CSV export error:", error);
    throw new Error("Failed to export to CSV");
  }
};
