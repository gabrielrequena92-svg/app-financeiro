"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringExpensesController = void 0;
const common_1 = require("@nestjs/common");
const recurring_expenses_service_1 = require("./recurring-expenses.service");
const client_1 = require("@prisma/client");
let RecurringExpensesController = class RecurringExpensesController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(data) {
        return this.service.create(data);
    }
    findAllByContext(contextId) {
        return this.service.findAllByContext(contextId);
    }
};
exports.RecurringExpensesController = RecurringExpensesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecurringExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('context/:contextId'),
    __param(0, (0, common_1.Param)('contextId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecurringExpensesController.prototype, "findAllByContext", null);
exports.RecurringExpensesController = RecurringExpensesController = __decorate([
    (0, common_1.Controller)('recurring-expenses'),
    __metadata("design:paramtypes", [recurring_expenses_service_1.RecurringExpensesService])
], RecurringExpensesController);
//# sourceMappingURL=recurring-expenses.controller.js.map