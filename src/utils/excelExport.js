import ExcelJS from 'exceljs';

/**
 * Exports a list of issues to a styled Excel sheet and triggers browser download.
 * Excludes soft-deleted issues.
 * @param {Array} issues The list of issues to export
 */
export const exportIssuesToExcel = async (issues) => {
  // Safeguard: Filter out any soft-deleted issues
  const activeIssues = issues.filter(issue => !issue.isDeleted);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('System Issues Log');

  // Set up columns
  worksheet.columns = [
    { header: 'Ticket ID', key: 'ticketId', width: 15 },
    { header: 'Reporter Name', key: 'userName', width: 22 },
    { header: 'Reporter Email', key: 'userEmail', width: 25 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Has Image', key: 'hasImage', width: 12 },
    { header: 'Remarks Count', key: 'remarksCount', width: 15 },
    { header: 'Created Date', key: 'createdAt', width: 22 },
  ];

  // Professional header styling (Indigo theme)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Segoe UI',
      family: 2,
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' } // Indigo-600
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: true
    };
  });

  // Populate data
  activeIssues.forEach((issue) => {
    // Determine Created Date
    let dateStr = '';
    if (issue.createdAt) {
      const date = issue.createdAt.toDate ? issue.createdAt.toDate() : new Date(issue.createdAt);
      dateStr = date.toLocaleString();
    }

    const remarksCount = issue.remarks ? issue.remarks.length : 0;
    const hasImageValue = (issue.imageUrl || issue.imageData) ? 'Yes' : 'No';

    worksheet.addRow({
      ticketId: issue.ticketId || 'N/A',
      userName: issue.userName || 'N/A',
      userEmail: issue.userEmail || 'N/A',
      title: issue.title || 'Untitled',
      category: issue.category || 'N/A',
      priority: issue.priority || 'Medium',
      status: issue.status || 'Pending',
      hasImage: hasImageValue,
      remarksCount: remarksCount,
      createdAt: dateStr
    });
  });

  // Format data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 22;
      row.eachCell((cell) => {
        cell.font = {
          name: 'Segoe UI',
          family: 2,
          size: 10
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
      });

      // Special styling for Priority and Status columns
      const priorityCell = row.getCell('priority');
      const priorityVal = priorityCell.value;
      if (priorityVal === 'Critical') {
        priorityCell.font = { name: 'Segoe UI', color: { argb: 'FFDC2626' }, bold: true }; // Red
      } else if (priorityVal === 'High') {
        priorityCell.font = { name: 'Segoe UI', color: { argb: 'FFE11D48' } }; // Rose
      } else if (priorityVal === 'Low') {
        priorityCell.font = { name: 'Segoe UI', color: { argb: 'FF4B5563' } }; // Gray
      }

      const statusCell = row.getCell('status');
      const statusVal = statusCell.value;
      if (statusVal === 'Resolved') {
        statusCell.font = { name: 'Segoe UI', color: { argb: 'FF16A34A' }, bold: true }; // Green
      } else if (statusVal === 'In Progress') {
        statusCell.font = { name: 'Segoe UI', color: { argb: 'FF2563EB' } }; // Blue
      } else if (statusVal === 'Pending') {
        statusCell.font = { name: 'Segoe UI', color: { argb: 'D97706' }, italic: true }; // Amber
      }
    }
  });

  // Write and download Excel workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  
  // Format current date in YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateFormatted = `${yyyy}-${mm}-${dd}`;

  anchor.href = url;
  anchor.download = `issues-${dateFormatted}.xlsx`;
  anchor.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
};
export default exportIssuesToExcel;
