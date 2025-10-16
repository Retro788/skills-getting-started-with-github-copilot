// Render activities with participants and signup
document.addEventListener('DOMContentLoaded', () => {
  loadActivities();
});

async function loadActivities() {
  const container = document.getElementById('activities');
  if (!container) return;
  container.innerHTML = '';

  const res = await fetch('/activities');
  const data = await res.json(); // { "Activity Name": { description, schedule, max_participants, participants: [] } }

  Object.entries(data).forEach(([name, act]) => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = name;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = act.description || '';
    card.appendChild(desc);

    const sched = document.createElement('p');
    sched.textContent = act.schedule || '';
    card.appendChild(sched);

    // --- Participants section ---
    const participantsSection = document.createElement('section');
    participantsSection.className = 'participants';

    const count = Array.isArray(act.participants) ? act.participants.length : 0;
    const header = document.createElement('h4');
    header.textContent = `Participants (${count} / ${act.max_participants})`;
    participantsSection.appendChild(header);

    const list = document.createElement('div');
    list.className = 'participants-list';
    if (count > 0) {
      act.participants.forEach(email => {
        const item = document.createElement('span');
        item.className = 'participant-item';
        item.textContent = email;
        const del = document.createElement('button');
        del.className = 'delete-icon';
        del.setAttribute('aria-label', `Remove ${email} from ${name}`);
        del.title = 'Remove';
        del.innerHTML = '&#10060;';
        del.onclick = async (e) => {
          e.stopPropagation();
          if (!confirm(`Remove ${email} from ${name}?`)) return;
          const resp = await fetch(`/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`, {
            method: 'DELETE'
          });
          if (resp.ok) {
            // Refresca solo la tarjeta
            const updated = await fetch('/activities').then(r => r.json());
            const newAct = updated[name];
            renderParticipants(list, name, newAct);
            header.textContent = `Participants (${newAct.participants.length} / ${newAct.max_participants})`;
          } else {
            alert('Could not remove participant.');
          }
        };
        item.appendChild(del);
        list.appendChild(item);
      });
    } else {
      const item = document.createElement('span');
      item.className = 'no-participant';
      item.textContent = 'No participants yet';
      list.appendChild(item);
    }
    participantsSection.appendChild(list);
    card.appendChild(participantsSection);

    // --- Signup UI ---
    const signup = document.createElement('div');
    signup.className = 'signup';

    const input = document.createElement('input');
    input.type = 'email';
    input.placeholder = 'student@mergington.edu';
    input.setAttribute('aria-label', `Email for ${name}`);

    const btn = document.createElement('button');
    btn.textContent = 'Sign up';
    btn.addEventListener('click', async () => {
      const email = input.value.trim();
      if (!email) return alert('Please enter an email');
      try {
        const resp = await fetch(`/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`, { method: 'POST' });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.detail || 'Signup failed');
        }
        input.value = '';
        // Refresca solo la tarjeta
        const updated = await fetch('/activities').then(r => r.json());
        const newAct = updated[name];
        renderParticipants(list, name, newAct);
        header.textContent = `Participants (${newAct.participants.length} / ${newAct.max_participants})`;
      } catch (e) {
        alert(e.message);
      }
    });
// Renderiza la lista de participantes de una actividad
function renderParticipants(list, name, act) {
  list.innerHTML = '';
  const count = Array.isArray(act.participants) ? act.participants.length : 0;
  if (count > 0) {
    act.participants.forEach(email => {
      const item = document.createElement('span');
      item.className = 'participant-item';
      item.textContent = email;
      const del = document.createElement('button');
      del.className = 'delete-icon';
      del.setAttribute('aria-label', `Remove ${email} from ${name}`);
      del.title = 'Remove';
      del.innerHTML = '&#10060;';
      del.onclick = async (e) => {
        e.stopPropagation();
        if (!confirm(`Remove ${email} from ${name}?`)) return;
        const resp = await fetch(`/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`, {
          method: 'DELETE'
        });
        if (resp.ok) {
          const updated = await fetch('/activities').then(r => r.json());
          const newAct = updated[name];
          renderParticipants(list, name, newAct);
        } else {
          alert('Could not remove participant.');
        }
      };
      item.appendChild(del);
      list.appendChild(item);
    });
  } else {
    const item = document.createElement('span');
    item.className = 'no-participant';
    item.textContent = 'No participants yet';
    list.appendChild(item);
  }
}

    signup.appendChild(input);
    signup.appendChild(btn);
    card.appendChild(signup);

    container.appendChild(card);
  });
}
