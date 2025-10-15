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

    const list = document.createElement('ul');
    if (count > 0) {
      act.participants.forEach(email => {
        const li = document.createElement('li');
        li.textContent = email;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No participants yet';
      list.appendChild(li);
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
        await loadActivities(); // refresh participants after a successful signup
      } catch (e) {
        alert(e.message);
      }
    });

    signup.appendChild(input);
    signup.appendChild(btn);
    card.appendChild(signup);

    container.appendChild(card);
  });
}
