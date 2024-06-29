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
const KEY = process.env.YOUTUBE_API_KEY;
function videoRequest(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${KEY}
    &part=contentDetails`;
        let data;
        try {
            const response = yield fetch(url);
            data = yield response.json();
        }
        catch (error) {
            throw error;
        }
        return data;
    });
}
module.exports = videoRequest;
