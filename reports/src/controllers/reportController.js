const Report = require('../models/Report');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

class ReportController {
  static async getReport(req, res) {
    const { reportType, report, name, format } = req.body;
    let reports;

    try {
      // Obtener los datos basados en el tipo de reporte
      switch (reportType) {
        case 'Miembros':
          reports = await Report.reportMembers(report, name);
          break;
        case 'Cursos':
          reports = await Report.reportCourses(report, name);
          break;
        case 'Usuarios':
          reports = await Report.reportStudents(report, name);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tipo de reporte no válido.',
          });
      }

      // Validar si hay datos
      if (!reports || reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron datos para el reporte solicitado.',
        });
      }

      // Generar archivo según el formato solicitado
      if (format === 'xlsx') {
        await ReportController.generateExcel(reports, res, reportType, report);
      } else if (format === 'pdf') {
        await ReportController.generatePDF(reports, res, reportType, report);
      } else {
        // Si no se especifica un formato, devolver JSON
        res.status(200).json({
          success: true,
          message: 'Datos obtenidos correctamente.',
          data: reports,
        });
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error.message);
      res.status(500).json({ message: 'Error al obtener los datos', error });
    }
  }

  // Función para generar un archivo Excel dinámico
  static async generateExcel(reports, res, reportType, report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType);

    // Obtener dinámicamente las columnas en base al primer elemento del reporte
    const columns = Object.keys(reports[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar encabezado
      key,
      width: 20,
    }));

    worksheet.columns = columns;

    // Agregar datos al Excel
    reports.forEach(report => {
      worksheet.addRow(report);
    });

    // Enviar archivo Excel como respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}.xlsx`);

    // Enviar archivo y datos en la respuesta
    await workbook.xlsx.write(res);

    // Retornar también los datos en formato JSON después de enviar el archivo
    res.status(200).json({
      success: true,
      message: 'Reporte generado correctamente.',
      data: reports,
    });
  }

  // Función para generar un archivo PDF dinámico
  static async generatePDF(reports, res, reportType, report) {
    const doc = new PDFDocument({
      layout: 'landscape', // Cambiar la orientación a horizontal
    });

    // Enviar encabezados para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}.pdf`);

    doc.pipe(res);

    const keys = Object.keys(reports[0]);
    const date = new Date().toISOString().split('T')[0];

    const table = {
      title: `Reporte de ${reportType}`,
      subtitle: `${report} - ${date}`,
      headers: keys.map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      rows: reports.map(report => Object.values(report)),
    };

    doc.table(table, { width: 700 });
    doc.end();

    // Esperar a que termine la generación del PDF y luego enviar la respuesta
    res.on('finish', () => {
      res.status(200).json({
        success: true,
        message: 'Reporte PDF generado correctamente.',
        data: reports,
      });
    });
  }
}

module.exports = ReportController;
