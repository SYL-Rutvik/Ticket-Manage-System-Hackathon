const getStorageKey = (ticketId) => `internal-notes-${ticketId}`;

const readNotes = (ticketId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(ticketId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeNotes = (ticketId, notes) => {
  localStorage.setItem(getStorageKey(ticketId), JSON.stringify(notes));
};

export const getNotes = async (ticketId) => readNotes(ticketId);

export const addNote = async (ticketId, text, author) => {
  const next = {
    id: crypto.randomUUID(),
    text,
    author,
    createdAt: new Date().toISOString(),
  };

  const notes = readNotes(ticketId);
  writeNotes(ticketId, [...notes, next]);
  return next;
};
