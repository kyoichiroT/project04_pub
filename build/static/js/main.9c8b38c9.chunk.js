(this.webpackJsonpproject04=this.webpackJsonpproject04||[]).push([[0],{38:function(t,e){t.exports={server:{host:"localhost",port:2e3}}},39:function(t,e,c){"use strict";c.r(e);var n=c(11),r=c.n(n),s=c(24),j=c.n(s),o=c(0);var i=c(27),u=c(22),a=c(26),b=c(38).server,h=Object(a.a)("".concat(b.host,":").concat(b.port)),l=function(){var t=Object(n.useState)(""),e=Object(u.a)(t,2),c=e[0],r=e[1],s=Object(n.useState)(""),j=Object(u.a)(s,2),a=j[0],b=j[1],l=Object(n.useState)([]),O=Object(u.a)(l,2),d=O[0],p=O[1];Object(n.useEffect)((function(){h.on("message",(function(t){p((function(e){return[].concat(Object(i.a)(e),[t])}))}))}),[]);return Object(o.jsxs)("div",{children:[Object(o.jsx)("h1",{children:"Chat App"}),c?Object(o.jsxs)("div",{children:[Object(o.jsxs)("h2",{children:["Welcome, ",c,"!"]}),Object(o.jsxs)("div",{children:[Object(o.jsx)("ul",{children:d.map((function(t,e){return Object(o.jsx)("li",{children:"".concat(t.user,": ").concat(t.text)},e)}))}),Object(o.jsxs)("form",{onSubmit:function(t){t.preventDefault(),h.emit("sendMessage",a),b("")},children:[Object(o.jsx)("input",{type:"text",value:a,onChange:function(t){return b(t.target.value)}}),Object(o.jsx)("button",{type:"submit",children:"Send"})]})]})]}):Object(o.jsxs)("div",{children:[Object(o.jsx)("input",{type:"text",value:c,onChange:function(t){return r(t.target.value)}}),Object(o.jsx)("button",{onClick:function(){h.emit("join",c)},children:"Join Chat"})]})]})};j.a.render(Object(o.jsx)(r.a.StrictMode,{children:Object(o.jsx)(l,{})}),document.getElementById("root"))}},[[39,1,2]]]);
//# sourceMappingURL=main.9c8b38c9.chunk.js.map