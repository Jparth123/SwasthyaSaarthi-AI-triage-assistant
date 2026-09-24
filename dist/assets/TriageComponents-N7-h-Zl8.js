import{c as a,j as e}from"./index-Bq0D-IdZ.js";import{C as r}from"./circle-check-big-CJ0h_O-d.js";import{T as c}from"./triangle-alert-fGT-Kf1k.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=a("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=a("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);function d({urgency:s}){if(!s)return e.jsx("span",{className:"badge-pending",children:"Pending"});switch(s){case"EMERGENCY":return e.jsxs("span",{className:"badge-emergency",children:[e.jsx(c,{size:10}),"Emergency"]});case"URGENT":return e.jsxs("span",{className:"badge-urgent",children:[e.jsx(i,{size:10}),"Urgent"]});case"ROUTINE":return e.jsxs("span",{className:"badge-routine",children:[e.jsx(r,{size:10}),"Routine"]});case"HUMAN_REVIEW":return e.jsxs("span",{className:"badge-review",children:[e.jsx(n,{size:10}),"Review"]});default:return e.jsx("span",{className:"badge-pending",children:s})}}export{i as C,d as T,n as a};
