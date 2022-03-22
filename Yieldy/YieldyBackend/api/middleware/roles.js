const AccessControl = require("accesscontrol");
const ac = new AccessControl();
exports.roles = (function () {

    //The ACL of Yieldy
    ac.grant("technician")
        .readOwn(["company", "config","device","message","system","task","user","status"])
        .updateOwn(["profile","config"])
        .createOwn(["message"])
        .readAny(["profile"])
        .grant("admin")
        .updateOwn(["device","task"])
        .deleteOwn(["device","task"])
        .createOwn(["task"])
        .extend("technician")
        .grant("co")
        .extend(["technician", "admin"])
        .deleteOwn(["profile","company","system","profile"])
        .updateOwn(["company","user","system","profile"])
        .createOwn(["company","system","profile"])

    return ac;
})();