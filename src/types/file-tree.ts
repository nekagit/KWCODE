export type CursorFileEntry = { name: string; path: string };

export type CursorTreeFolder = {
  type: "folder";
  name: string;
  path: string;
  children: CursorTreeNode[];
};

export type CursorTreeFile = {
  type: "file";
  name: string;
  path: string;
};

export type CursorTreeNode = CursorTreeFolder | CursorTreeFile;
