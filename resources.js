/* resources.js
   Client-side demo resource lifecycle manager.
   Stores data in localStorage and exposes functions/events for UI.
*/
(function(window){
  const KEY = 'recy_resources_v1';
  const REQ_KEY = 'recy_requests_v1';
  const CHAT_KEY = 'recy_chats_v1';

  function read(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){return [];} }
  function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  function uid(prefix='id'){ return prefix + '_' + Date.now() + '_' + Math.floor(Math.random()*9999); }

  // Resources: {id, donorEmail, title, type, qty, condition, image, lat, lng, createdAt, status}
  function addResource(resource){
    const list = read(KEY);
    resource.id = uid('res');
    resource.createdAt = new Date().toISOString();
    resource.status = 'available';
    list.unshift(resource);
    write(KEY, list);
    document.dispatchEvent(new CustomEvent('recy:resource-added', { detail: resource }));
    return resource;
  }

  function listResources(){ return read(KEY); }

  function getResource(id){ return listResources().find(r=>r.id===id); }

  // Requests: {id, resourceId, upcyclerEmail, reason, idea, when, status, createdAt}
  function requestResource({resourceId, upcyclerEmail, reason, idea, when}){
    const reqs = read(REQ_KEY);
    const r = { id: uid('req'), resourceId, upcyclerEmail, reason, idea, when, status: 'pending', createdAt: new Date().toISOString() };
    reqs.unshift(r);
    write(REQ_KEY, reqs);
    document.dispatchEvent(new CustomEvent('recy:resource-requested', { detail: r }));
    // notify donor (UI should listen for event)
    return r;
  }

  function listRequestsForDonor(donorEmail){
    const reqs = read(REQ_KEY);
    const resources = listResources();
    const donorResIds = resources.filter(r=>r.donorEmail===donorEmail).map(r=>r.id);
    return reqs.filter(q=>donorResIds.includes(q.resourceId));
  }

  function listRequestsForUpcycler(email){ return read(REQ_KEY).filter(q=>q.upcyclerEmail===email); }

  function updateRequestStatus(requestId, status, reason=''){
    const reqs = read(REQ_KEY);
    const r = reqs.find(x=>x.id===requestId);
    if(!r) return null;
    r.status = status;
    r.decisionReason = reason;
    r.decisionAt = new Date().toISOString();
    write(REQ_KEY, reqs);
    document.dispatchEvent(new CustomEvent('recy:request-updated', { detail: r }));
    return r;
  }

  // Chat rooms: {id, participants: [emails], resourceId, messages: [{from, text, ts}] }
  function createChatRoom(resourceId, a, b){
    const rooms = read(CHAT_KEY);
    const id = uid('chat');
    const room = { id, resourceId, participants:[a,b], messages:[], createdAt:new Date().toISOString() };
    rooms.push(room);
    write(CHAT_KEY, rooms);
    document.dispatchEvent(new CustomEvent('recy:chat-created', { detail: room }));
    return room;
  }

  function postMessage(chatId, from, text){
    const rooms = read(CHAT_KEY);
    const room = rooms.find(r=>r.id===chatId);
    if(!room) return null;
    const msg = { from, text, ts: new Date().toISOString() };
    room.messages.push(msg);
    write(CHAT_KEY, rooms);
    document.dispatchEvent(new CustomEvent('recy:chat-message', { detail: { chatId, msg } }));
    return msg;
  }

  function listChatsFor(email){ return read(CHAT_KEY).filter(r=>r.participants.includes(email)); }

  function markResourceCompleted(resourceId){
    const list = read(KEY);
    const r = list.find(x=>x.id===resourceId);
    if(!r) return null;
    r.status = 'completed';
    r.completedAt = new Date().toISOString();
    write(KEY, list);
    document.dispatchEvent(new CustomEvent('recy:resource-completed', { detail: r }));
    return r;
  }

  // Post product to marketplace (simple): product {id, upcyclerEmail, resourceId, title, images, steps, price, createdAt}
  const MARKET_KEY = 'recy_products_v1';
  function postProduct(product){ const list = read(MARKET_KEY); product.id = uid('prod'); product.createdAt = new Date().toISOString(); list.unshift(product); write(MARKET_KEY, list); document.dispatchEvent(new CustomEvent('recy:product-posted',{detail:product})); return product; }

  // Impact score: naive calculation
  function computeImpactForResource(resourceId){
    const r = getResource(resourceId); if(!r) return null;
    // base scores by type
    const typeScore = { fabric:2, wood:3, glass:2, plastic:1.5, tools:2.5 };
    const t = (r.type||'plastic').toLowerCase();
    const base = typeScore[t] || 1;
    const qtyFactor = Math.min(10, (r.qty && Number(r.qty)) || 1);
    const reuseMultiplier = r.status==='completed' ? 1.5 : 1.0;
    const score = Math.round(base * qtyFactor * reuseMultiplier * 10)/10;
    return { resourceId, score };
  }

  function rate(partnerEmail, byEmail, rating, comment){
    const key = 'recy_ratings_v1';
    const list = read(key);
    const item = { id: uid('rate'), partnerEmail, byEmail, rating, comment, ts: new Date().toISOString() };
    list.push(item); write(key, list); document.dispatchEvent(new CustomEvent('recy:rating', { detail: item })); return item;
  }

  window.RecyResources = {
    addResource, listResources, getResource,
    requestResource, listRequestsForDonor, listRequestsForUpcycler, updateRequestStatus,
    createChatRoom, postMessage, listChatsFor,
    markResourceCompleted, postProduct, computeImpactForResource, rate
  };
})(window);
