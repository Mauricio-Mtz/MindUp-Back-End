const Report = require('../models/Report');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ReportController {
  static async getReport(req, res) {
    const { reportType, report, name, startDate, endDate, format } = req.body;

    try {
      // Ejecutamos la consulta al modelo con los datos recibidos
      const reports = await Report.getReport();

      if (reports.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No hay módulos.',
        });
      }

      // Generar archivo Excel o PDF basado en el formato solicitado
      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Agregar encabezados
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Nombre', key: 'name', width: 32 },
          { header: 'Descripción', key: 'description', width: 50 },
        ];

        // Agregar datos al Excel
        reports.forEach(report => {
          worksheet.addRow(report);
        });

        // Enviar archivo Excel como respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

        await workbook.xlsx.write(res);
        res.end();

      } else if (format === 'pdf') {
        const doc = new PDFDocument();

        // Enviar encabezados para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

        // Escribir el contenido del PDF
        doc.pipe(res);
        doc.fontSize(20).text('Reporte de Módulos', { align: 'center' });
        doc.moveDown();

        reports.forEach(report => {
          doc.fontSize(12).text(`ID: ${report.id}`);
          doc.text(`Nombre: ${report.name}`);
          doc.text(`Descripción: ${report.description}`);
          doc.moveDown();
        });

        doc.end();

      } else {
        // Si no se especifica un formato, devolver JSON
        res.status(200).json({
          success: true,
          message: 'Módulos obtenidos correctamente.',
          data: reports,
        });
      }

    } catch (error) {
      console.error('Error al obtener los módulos:', error.message);
      res.status(500).json({ message: 'Error al obtener los módulos', error });
    }
  }
}

module.exports = ReportController;
