const fs = require('fs');

let content = fs.readFileSync('src/store.ts', 'utf8');

// 1. Add to Promise.all in fetchInitialData
const promiseAllMatch = content.match(/const results = await Promise\.all\(\[\s*([\s\S]*?)\s*\]\);/);
if (promiseAllMatch) {
  let inner = promiseAllMatch[1];
  const newTables = [
    'renovations', 'moves', 'billing_rules', 'budget_forecasts', 
    'feedbacks', 'reservations', 'staff', 'keys', 'classifieds', 'lost_and_found'
  ];
  for (const table of newTables) {
    if (!inner.includes(`supabase.from('${table}')`)) {
      inner += `,\n            supabase.from('${table}').select('*')`;
    }
  }
  content = content.replace(promiseAllMatch[0], `const results = await Promise.all([\n            ${inner}\n          ]);`);
}

// 2. Destructure results
const destructureMatch = content.match(/const \[\s*([\s\S]*?)\s*\] = results;/);
if (destructureMatch) {
  let inner = destructureMatch[1];
  const newVars = [
    'renovationsRes', 'movesRes', 'billingRulesRes', 'budgetForecastsRes', 
    'feedbacksRes', 'reservationsRes', 'staffRes', 'keysRes', 'classifiedsRes', 'lostAndFoundRes'
  ];
  for (const v of newVars) {
    if (!inner.includes(v)) {
      inner += `, ${v}`;
    }
  }
  content = content.replace(destructureMatch[0], `const [\n            ${inner}\n          ] = results;`);
}

// 3. Assign to newState
const assignMatch = content.match(/if \(usersRes\.data\) \{\s*newState\.users = usersRes\.data\.map[\s\S]*?\}\s*\}/);
if (assignMatch) {
  const newAssignments = `
          if (renovationsRes && renovationsRes.data) {
            newState.renovations = renovationsRes.data.map(r => ({
              id: r.id, clientId: r.client_id, title: r.title, description: r.description,
              startDate: r.start_date, endDate: r.end_date, status: r.status,
              artFileUrl: r.art_file_url, technicianName: r.technician_name
            }));
          }
          if (movesRes && movesRes.data) {
            newState.moves = movesRes.data.map(m => ({
              id: m.id, clientId: m.client_id, date: m.date, type: m.type, status: m.status, notes: m.notes
            }));
          }
          if (billingRulesRes && billingRulesRes.data) {
            newState.billingRules = billingRulesRes.data.map(b => ({
              id: b.id, name: b.name, daysBeforeDue: b.days_before_due || [],
              daysAfterDue: b.days_after_due || [], messageTemplate: b.message_template, active: b.active
            }));
          }
          if (budgetForecastsRes && budgetForecastsRes.data) {
            newState.budgetForecasts = budgetForecastsRes.data.map(b => ({
              id: b.id, createdAt: b.created_at, month: b.month,
              monthlyProjections: b.monthly_projections || [], categories: b.categories || [],
              insights: b.insights || [], confidence: b.confidence
            }));
          }
          if (feedbacksRes && feedbacksRes.data) {
            newState.feedbacks = feedbacksRes.data.map(f => ({
              id: f.id, clientId: f.client_id, locationId: f.location_id, rating: f.rating,
              comment: f.comment, userName: f.user_name, date: f.date
            }));
          }
          if (reservationsRes && reservationsRes.data) {
            newState.reservations = reservationsRes.data.map(r => ({
              id: r.id, clientId: r.client_id, areaName: r.area_name, date: r.date,
              startTime: r.start_time, endTime: r.end_time, status: r.status, notes: r.notes
            }));
          }
          if (staffRes && staffRes.data) {
            newState.staff = staffRes.data.map(s => ({
              id: s.id, name: s.name, role: s.role, phone: s.phone, email: s.email,
              shift: s.shift, status: s.status
            }));
          }
          if (keysRes && keysRes.data) {
            newState.keys = keysRes.data.map(k => ({
              id: k.id, keyName: k.key_name, location: k.location, status: k.status,
              borrowedBy: k.borrowed_by, borrowedAt: k.borrowed_at, returnedAt: k.returned_at
            }));
          }
          if (classifiedsRes && classifiedsRes.data) {
            newState.classifieds = classifiedsRes.data.map(c => ({
              id: c.id, title: c.title, description: c.description, price: c.price,
              category: c.category, authorId: c.author_id, authorName: c.author_name,
              contactPhone: c.contact_phone, createdAt: c.created_at, images: c.images || [], status: c.status
            }));
          }
          if (lostAndFoundRes && lostAndFoundRes.data) {
            newState.lostAndFound = lostAndFoundRes.data.map(l => ({
              id: l.id, title: l.title, description: l.description, location: l.location,
              dateFound: l.date_found, status: l.status, images: l.images || [],
              reporterId: l.reporter_id, reporterName: l.reporter_name,
              returnedTo: l.returned_to, returnedAt: l.returned_at
            }));
          }
`;
  content = content.replace(assignMatch[0], assignMatch[0] + newAssignments);
}

// 4. Add Supabase calls to reservations, staff, keys, classifieds, lost_and_found
const replacements = [
  {
    find: /addReservation: \(reservation\) => set\(\(state\) => \(\{\s*reservations: \[\.\.\.state\.reservations, \{ \.\.\.reservation, id: uuidv4\(\) \}\]\s*\}\)\),/,
    replace: `addReservation: async (reservation) => {
        const id = uuidv4();
        set((state) => ({ reservations: [...state.reservations, { ...reservation, id }] }));
        if (isSupabaseConfigured) {
          await supabase.from('reservations').insert([{
            id, client_id: reservation.clientId, area_name: reservation.areaName,
            date: reservation.date, start_time: reservation.startTime, end_time: reservation.endTime,
            status: reservation.status, notes: reservation.notes
          }]);
        }
      },`
  },
  {
    find: /updateReservation: \(id, reservation\) => set\(\(state\) => \(\{\s*reservations: state\.reservations\.map\(r => r\.id === id \? \{ \.\.\.r, \.\.\.reservation \} : r\)\s*\}\)\),/,
    replace: `updateReservation: async (id, reservation) => {
        set((state) => ({ reservations: state.reservations.map(r => r.id === id ? { ...r, ...reservation } : r) }));
        if (isSupabaseConfigured) {
          const updateData: any = {};
          if (reservation.clientId !== undefined) updateData.client_id = reservation.clientId;
          if (reservation.areaName !== undefined) updateData.area_name = reservation.areaName;
          if (reservation.date !== undefined) updateData.date = reservation.date;
          if (reservation.startTime !== undefined) updateData.start_time = reservation.startTime;
          if (reservation.endTime !== undefined) updateData.end_time = reservation.endTime;
          if (reservation.status !== undefined) updateData.status = reservation.status;
          if (reservation.notes !== undefined) updateData.notes = reservation.notes;
          await supabase.from('reservations').update(updateData).eq('id', id);
        }
      },`
  },
  {
    find: /deleteReservation: \(id\) => set\(\(state\) => \(\{\s*reservations: state\.reservations\.filter\(r => r\.id !== id\)\s*\}\)\),/,
    replace: `deleteReservation: async (id) => {
        set((state) => ({ reservations: state.reservations.filter(r => r.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('reservations').delete().eq('id', id);
      },`
  },
  {
    find: /addStaff: \(staff\) => \{\s*const id = uuidv4\(\);\s*set\(\(state\) => \(\{\s*staff: \[\.\.\.state\.staff, \{ \.\.\.staff, id \}\]\s*\}\)\);\s*\},/,
    replace: `addStaff: async (staff) => {
        const id = uuidv4();
        set((state) => ({ staff: [...state.staff, { ...staff, id }] }));
        if (isSupabaseConfigured) {
          await supabase.from('staff').insert([{
            id, name: staff.name, role: staff.role, phone: staff.phone,
            email: staff.email, shift: staff.shift, status: staff.status
          }]);
        }
      },`
  },
  {
    find: /updateStaff: \(id, staff\) => set\(\(state\) => \(\{\s*staff: state\.staff\.map\(s => s\.id === id \? \{ \.\.\.s, \.\.\.staff \} : s\)\s*\}\)\),/,
    replace: `updateStaff: async (id, staff) => {
        set((state) => ({ staff: state.staff.map(s => s.id === id ? { ...s, ...staff } : s) }));
        if (isSupabaseConfigured) await supabase.from('staff').update(staff).eq('id', id);
      },`
  },
  {
    find: /deleteStaff: \(id\) => set\(\(state\) => \(\{\s*staff: state\.staff\.filter\(s => s\.id !== id\)\s*\}\)\),/,
    replace: `deleteStaff: async (id) => {
        set((state) => ({ staff: state.staff.filter(s => s.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('staff').delete().eq('id', id);
      },`
  },
  {
    find: /addKey: \(key\) => \{\s*const id = uuidv4\(\);\s*set\(\(state\) => \(\{\s*keys: \[\.\.\.state\.keys, \{ \.\.\.key, id \}\]\s*\}\)\);\s*\},/,
    replace: `addKey: async (key) => {
        const id = uuidv4();
        set((state) => ({ keys: [...state.keys, { ...key, id }] }));
        if (isSupabaseConfigured) {
          await supabase.from('keys').insert([{
            id, key_name: key.keyName, location: key.location, status: key.status,
            borrowed_by: key.borrowedBy, borrowed_at: key.borrowedAt, returned_at: key.returnedAt
          }]);
        }
      },`
  },
  {
    find: /updateKey: \(id, key\) => set\(\(state\) => \(\{\s*keys: state\.keys\.map\(k => k\.id === id \? \{ \.\.\.k, \.\.\.key \} : k\)\s*\}\)\),/,
    replace: `updateKey: async (id, key) => {
        set((state) => ({ keys: state.keys.map(k => k.id === id ? { ...k, ...key } : k) }));
        if (isSupabaseConfigured) {
          const updateData: any = {};
          if (key.keyName !== undefined) updateData.key_name = key.keyName;
          if (key.location !== undefined) updateData.location = key.location;
          if (key.status !== undefined) updateData.status = key.status;
          if (key.borrowedBy !== undefined) updateData.borrowed_by = key.borrowedBy;
          if (key.borrowedAt !== undefined) updateData.borrowed_at = key.borrowedAt;
          if (key.returnedAt !== undefined) updateData.returned_at = key.returnedAt;
          await supabase.from('keys').update(updateData).eq('id', id);
        }
      },`
  },
  {
    find: /deleteKey: \(id\) => set\(\(state\) => \(\{\s*keys: state\.keys\.filter\(k => k\.id !== id\)\s*\}\)\),/,
    replace: `deleteKey: async (id) => {
        set((state) => ({ keys: state.keys.filter(k => k.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('keys').delete().eq('id', id);
      },`
  },
  {
    find: /addClassified: \(classified\) => set\(\(state\) => \(\{\s*classifieds: \[\.\.\.state\.classifieds, \{ \.\.\.classified, id: uuidv4\(\), createdAt: new Date\(\)\.toISOString\(\), status: 'ACTIVE' \}\]\s*\}\)\),/,
    replace: `addClassified: async (classified) => {
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        set((state) => ({ classifieds: [...state.classifieds, { ...classified, id, createdAt, status: 'ACTIVE' }] }));
        if (isSupabaseConfigured) {
          await supabase.from('classifieds').insert([{
            id, title: classified.title, description: classified.description, price: classified.price,
            category: classified.category, author_id: classified.authorId, author_name: classified.authorName,
            contact_phone: classified.contactPhone, created_at: createdAt, images: classified.images, status: 'ACTIVE'
          }]);
        }
      },`
  },
  {
    find: /updateClassified: \(id, classified\) => set\(\(state\) => \(\{\s*classifieds: state\.classifieds\.map\(c => c\.id === id \? \{ \.\.\.c, \.\.\.classified \} : c\)\s*\}\)\),/,
    replace: `updateClassified: async (id, classified) => {
        set((state) => ({ classifieds: state.classifieds.map(c => c.id === id ? { ...c, ...classified } : c) }));
        if (isSupabaseConfigured) {
          const updateData: any = { ...classified };
          if (classified.authorId !== undefined) { updateData.author_id = classified.authorId; delete updateData.authorId; }
          if (classified.authorName !== undefined) { updateData.author_name = classified.authorName; delete updateData.authorName; }
          if (classified.contactPhone !== undefined) { updateData.contact_phone = classified.contactPhone; delete updateData.contactPhone; }
          await supabase.from('classifieds').update(updateData).eq('id', id);
        }
      },`
  },
  {
    find: /deleteClassified: \(id\) => set\(\(state\) => \(\{\s*classifieds: state\.classifieds\.filter\(c => c\.id !== id\)\s*\}\)\),/,
    replace: `deleteClassified: async (id) => {
        set((state) => ({ classifieds: state.classifieds.filter(c => c.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('classifieds').delete().eq('id', id);
      },`
  },
  {
    find: /addLostAndFound: \(item\) => set\(\(state\) => \(\{\s*lostAndFound: \[\.\.\.state\.lostAndFound, \{ \.\.\.item, id: uuidv4\(\), status: 'FOUND' \}\]\s*\}\)\),/,
    replace: `addLostAndFound: async (item) => {
        const id = uuidv4();
        set((state) => ({ lostAndFound: [...state.lostAndFound, { ...item, id, status: 'FOUND' }] }));
        if (isSupabaseConfigured) {
          await supabase.from('lost_and_found').insert([{
            id, title: item.title, description: item.description, location: item.location,
            date_found: item.dateFound, status: 'FOUND', images: item.images,
            reporter_id: item.reporterId, reporter_name: item.reporterName
          }]);
        }
      },`
  },
  {
    find: /updateLostAndFound: \(id, item\) => set\(\(state\) => \(\{\s*lostAndFound: state\.lostAndFound\.map\(i => i\.id === id \? \{ \.\.\.i, \.\.\.item \} : i\)\s*\}\)\),/,
    replace: `updateLostAndFound: async (id, item) => {
        set((state) => ({ lostAndFound: state.lostAndFound.map(i => i.id === id ? { ...i, ...item } : i) }));
        if (isSupabaseConfigured) {
          const updateData: any = { ...item };
          if (item.dateFound !== undefined) { updateData.date_found = item.dateFound; delete updateData.dateFound; }
          if (item.reporterId !== undefined) { updateData.reporter_id = item.reporterId; delete updateData.reporterId; }
          if (item.reporterName !== undefined) { updateData.reporter_name = item.reporterName; delete updateData.reporterName; }
          if (item.returnedTo !== undefined) { updateData.returned_to = item.returnedTo; delete updateData.returnedTo; }
          if (item.returnedAt !== undefined) { updateData.returned_at = item.returnedAt; delete updateData.returnedAt; }
          await supabase.from('lost_and_found').update(updateData).eq('id', id);
        }
      },`
  },
  {
    find: /deleteLostAndFound: \(id\) => set\(\(state\) => \(\{\s*lostAndFound: state\.lostAndFound\.filter\(i => i\.id !== id\)\s*\}\)\),/,
    replace: `deleteLostAndFound: async (id) => {
        set((state) => ({ lostAndFound: state.lostAndFound.filter(i => i.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('lost_and_found').delete().eq('id', id);
      },`
  }
];

for (const r of replacements) {
  content = content.replace(r.find, r.replace);
}

fs.writeFileSync('src/store.ts', content);
console.log('Patched store.ts successfully');
