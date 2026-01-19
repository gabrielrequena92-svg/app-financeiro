"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringExpensesModule = void 0;
const common_1 = require("@nestjs/common");
const recurring_expenses_service_1 = require("./recurring-expenses.service");
const recurring_expenses_controller_1 = require("./recurring-expenses.controller");
const prisma_service_1 = require("../prisma/prisma.service");
let RecurringExpensesModule = class RecurringExpensesModule {
};
exports.RecurringExpensesModule = RecurringExpensesModule;
exports.RecurringExpensesModule = RecurringExpensesModule = __decorate([
    (0, common_1.Module)({
        controllers: [recurring_expenses_controller_1.RecurringExpensesController],
        providers: [recurring_expenses_service_1.RecurringExpensesService, prisma_service_1.PrismaService],
    })
], RecurringExpensesModule);
//# sourceMappingURL=recurring-expenses.module.js.map