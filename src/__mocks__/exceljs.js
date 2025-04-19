// ExcelJS mock implementation
const mockWorkbook = {
  addWorksheet: jest.fn().mockReturnThis(),
  xlsx: {
    writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
  }
};

const mockWorksheet = {
  columns: [],
  getRow: jest.fn().mockReturnThis(),
  addRow: jest.fn(),
  eachRow: jest.fn(),
  font: {}
};

mockWorkbook.addWorksheet.mockReturnValue(mockWorksheet);

// Export mock Workbook class
class Workbook {
  constructor() {
    return mockWorkbook;
  }
}

// Export as ES Module default
const ExcelJS = {
  Workbook
};

module.exports = ExcelJS;
module.exports.default = ExcelJS;