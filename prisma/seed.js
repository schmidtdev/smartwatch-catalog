"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var smartwatch1, smartwatch2, smartwatch3, email, password, hashedPassword, adminUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Start seeding ...');
                    return [4 /*yield*/, prisma.smartwatch.create({
                            data: {
                                name: 'Galaxy Watch 5 Pro',
                                brand: 'Samsung',
                                description: 'The ultimate smartwatch for outdoor adventurers.',
                                price: 399.99,
                                imageUrl: '/images/galaxy-watch-5-pro.jpg', // Placeholder image URL
                                isPublished: true,
                                features: {
                                    create: [
                                        { name: 'GPS' },
                                        { name: 'Bateria de longa duração' },
                                        { name: 'Monitoramento de atividades' },
                                        { name: 'Resistência à água' },
                                    ],
                                },
                            },
                        })];
                case 1:
                    smartwatch1 = _a.sent();
                    console.log("Created smartwatch with id: ".concat(smartwatch1.id));
                    return [4 /*yield*/, prisma.smartwatch.create({
                            data: {
                                name: 'Apple Watch Series 8',
                                brand: 'Apple',
                                description: 'A grande tela Retina Sempre Ativa. Tudo o que você precisa para uma vida mais saudável, segura e conectada.',
                                price: 429.00,
                                imageUrl: '/images/apple-watch-series-8.jpg', // Placeholder image URL
                                isPublished: true,
                                features: {
                                    create: [
                                        { name: 'Detecção de Colisão' },
                                        { name: 'Sensor de temperatura' },
                                        { name: 'ECG' },
                                        { name: 'Monitoramento de atividades' },
                                    ],
                                },
                            },
                        })];
                case 2:
                    smartwatch2 = _a.sent();
                    console.log("Created smartwatch with id: ".concat(smartwatch2.id));
                    return [4 /*yield*/, prisma.smartwatch.create({
                            data: {
                                name: 'Forerunner 955 Solar',
                                brand: 'Garmin',
                                description: 'Corra por mais tempo com um smartwatch de corrida com GPS com carregamento solar.',
                                price: 599.99,
                                imageUrl: '/images/forerunner-955-solar.jpg', // Placeholder image URL
                                isPublished: true,
                                features: {
                                    create: [
                                        { name: 'Carregamento Solar' },
                                        { name: 'GPS Multibanda' },
                                        { name: 'Métricas de desempenho avançadas' },
                                        { name: 'Mapas coloridos integrados' },
                                    ],
                                },
                            },
                        })];
                case 3:
                    smartwatch3 = _a.sent();
                    console.log("Created smartwatch with id: ".concat(smartwatch3.id));
                    email = process.env.ADMIN_EMAIL || 'admin@example.com';
                    password = process.env.ADMIN_PASSWORD || 'password' // TODO: Change default password in production!
                    ;
                    return [4 /*yield*/, (0, bcryptjs_1.hash)(password, 10)
                        // Create or update the admin user
                    ]; // 10 is the salt rounds
                case 4:
                    hashedPassword = _a.sent() // 10 is the salt rounds
                    ;
                    return [4 /*yield*/, prisma.adminUser.upsert({
                            where: { email: email },
                            update: { password: hashedPassword },
                            create: {
                                email: email,
                                password: hashedPassword,
                            },
                        })];
                case 5:
                    adminUser = _a.sent();
                    console.log("Admin user created/updated: ".concat(adminUser.email));
                    console.log('Seeding finished.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
