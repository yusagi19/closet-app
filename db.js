'use strict';

class ClosetDB {
  constructor() {
    this.db = null;
    this.DB_NAME = 'closet-db';
    this.DB_VER  = 1;
    this.STORE   = 'items';
  }

  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VER);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { this.db = req.result; resolve(); };
      req.onupgradeneeded = ({ target: { result: db } }) => {
        const store = db.createObjectStore(this.STORE, { keyPath: 'id' });
        store.createIndex('owner',     'owner',     { unique: false });
        store.createIndex('category',  'category',  { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      };
    });
  }

  _do(mode, fn) {
    return new Promise((resolve, reject) => {
      const tx  = this.db.transaction(this.STORE, mode);
      const st  = tx.objectStore(this.STORE);
      const req = fn(st);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  add(item)  { return this._do('readwrite', s => s.add(item)); }
  put(item)  { return this._do('readwrite', s => s.put(item)); }
  remove(id) { return this._do('readwrite', s => s.delete(id)); }
  get(id)    { return this._do('readonly',  s => s.get(id)); }
  getAll()   { return this._do('readonly',  s => s.getAll()); }
}

const db = new ClosetDB();
