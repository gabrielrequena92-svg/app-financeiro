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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    usersService;
    constructor(usersService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'place-holder',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place-holder',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/redirect',
            scope: ['email', 'profile'],
        });
        this.usersService = usersService;
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { name, emails } = profile;
        const email = emails[0].value;
        let user = await this.usersService.findOne(email);
        if (!user) {
            user = await this.usersService.createWithGoogle({
                email,
                name: name.givenName + ' ' + name.familyName,
            });
        }
        done(null, user);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map