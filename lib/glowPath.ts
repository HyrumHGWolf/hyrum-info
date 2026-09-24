import {
  EDGE_OFFSET,
  EDGE_PATH,
  NODES,
  type FigureNode,
} from "./figure";

const SNAP = 12;

type Cmd = {
  op: string;
  params: number[];
  x: number;
  y: number;
};

function nearestNodeId(x: number, y: number): string | null {
  let best: string | null = null;
  let bestD = SNAP * SNAP;
  for (const n of NODES) {
    const dd = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (dd <= bestD) {
      bestD = dd;
      best = n.id;
    }
  }
  return best;
}

function parseSubpaths(d: string): Cmd[][] {
  const tokens = d.match(/[MLHVCSQTAZ]|-?[\d.]+/gi);
  if (!tokens) return [];
  const ox = EDGE_OFFSET.x;
  const oy = EDGE_OFFSET.y;
  let cmd = "";
  let x = 0;
  let y = 0;
  let p = 0;
  const num = () => parseFloat(tokens[p++]);
  const subpaths: Cmd[][] = [];
  let cur: Cmd[] | null = null;

  while (p < tokens.length) {
    const t = tokens[p];
    if (/^[MLHVCSQTAZ]$/i.test(t)) {
      cmd = t.toUpperCase();
      p++;
    }
    switch (cmd) {
      case "M": {
        x = +(num() + ox).toFixed(2);
        y = +(num() + oy).toFixed(2);
        cur = [{ op: "M", params: [x, y], x, y }];
        subpaths.push(cur);
        cmd = "L";
        break;
      }
      case "L": {
        x = +(num() + ox).toFixed(2);
        y = +(num() + oy).toFixed(2);
        cur?.push({ op: "L", params: [x, y], x, y });
        break;
      }
      case "H": {
        x = +(num() + ox).toFixed(2);
        cur?.push({ op: "H", params: [x], x, y });
        break;
      }
      case "V": {
        y = +(num() + oy).toFixed(2);
        cur?.push({ op: "V", params: [y], x, y });
        break;
      }
      case "C": {
        const x1 = +(num() + ox).toFixed(2);
        const y1 = +(num() + oy).toFixed(2);
        const x2 = +(num() + ox).toFixed(2);
        const y2 = +(num() + oy).toFixed(2);
        x = +(num() + ox).toFixed(2);
        y = +(num() + oy).toFixed(2);
        cur?.push({ op: "C", params: [x1, y1, x2, y2, x, y], x, y });
        break;
      }
      default:
        p++;
    }
  }
  return subpaths;
}

function commandD(op: string, params: number[]): string {
  return `${op}${params.join(" ")}`;
}

function reverseCommand(prev: Cmd, cmd: Cmd): string {
  switch (cmd.op) {
    case "L":
      return `L${prev.x} ${prev.y}`;
    case "H":
      return `H${prev.x}`;
    case "V":
      return `V${prev.y}`;
    case "C": {
      const [x1, y1, x2, y2] = cmd.params;
      return `C${x2} ${y2} ${x1} ${y1} ${prev.x} ${prev.y}`;
    }
    default:
      return `L${prev.x} ${prev.y}`;
  }
}

const SUBPATHS = parseSubpaths(EDGE_PATH);

/** SVG path `d` along the constellation line art from node A to node B. */
export function glowPathBetween(a: FigureNode, b: FigureNode): string | null {
  for (const cmds of SUBPATHS) {
    for (let i = 1; i < cmds.length; i++) {
      const fromId = nearestNodeId(cmds[i - 1].x, cmds[i - 1].y);
      const toId = nearestNodeId(cmds[i].x, cmds[i].y);
      if (fromId === a.id && toId === b.id) {
        return `M${cmds[i - 1].x} ${cmds[i - 1].y} ${commandD(cmds[i].op, cmds[i].params)}`;
      }
      if (fromId === b.id && toId === a.id) {
        return `M${cmds[i].x} ${cmds[i].y} ${reverseCommand(cmds[i - 1], cmds[i])}`;
      }
    }
  }
  return null;
}
