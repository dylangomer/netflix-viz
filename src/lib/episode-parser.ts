  export function identifyShow(title?: string) {
    if (!title) return "";
    const firstColon = title.indexOf(":");
    return (firstColon === -1 ? title : title.slice(0, firstColon)).trim();
  }