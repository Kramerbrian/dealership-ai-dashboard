import React from "react";
export default function EvidencePacketButton({ payload }: { payload: any }){
  async function handleClick(){
    await fetch("/api/evidence/packet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r=> r.json()).then(d=> {
        const a = document.createElement("a");
        const blob = new Blob([JSON.stringify(d.packet, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        a.href = url; a.download = `evidence_packet_${Date.now()}.json`; a.click();
        URL.revokeObjectURL(url);
      });
  }
  return <button onClick={handleClick} className="px-3 py-2 rounded-lg bg-black text-white text-sm">Export Evidence Packet</button>;
}

