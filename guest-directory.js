const GUEST_DIRECTORY_API = 'https://script.google.com/macros/s/AKfycbxwrzF8av2VzyuAPjtA_bOyB-H6LvwLF6Cv_Ubq3P0rccsiXzUp3wIObxc23LQz7a5cig/exec';

const guestGrid = document.querySelector('#guest-directory-grid');

function guestImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) === false) url = `https://${url}`;
  const githubMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
  if (githubMatch) return `https://raw.githubusercontent.com/${githubMatch[1]}/${githubMatch[2]}/${githubMatch[3]}/${githubMatch[4]}`;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
  return driveMatch ? `https://drive.google.com/uc?export=view&id=${driveMatch[1]}` : url;
}

function safeText(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function buildCard(staff, index) {
  const card = document.createElement('article');
  const name = safeText(staff.name || '이름 미등록');
  // 현재 시트 구성: A열 이름, B열 이미지 링크, C열 직업.
  // 기존 배포 코드가 B·C열을 hp·str로 반환하는 경우도 함께 처리한다.
  const imageUrl = guestImageUrl(staff.img || staff.image || staff.hp);
  const position = safeText(staff.position || staff.job || staff.role || staff.str || '직업 미정');

  card.className = 'guest-record-card staff-public-card';
  card.innerHTML = `
    <span class="guest-record-label">THEOBROMA STAFF / ${String(index + 1).padStart(2, '0')}</span>
    <span class="guest-record-image">${imageUrl ? `<img src="${safeText(imageUrl)}" alt="${name} 초상">` : '<span>STAFF<br>PORTRAIT</span>'}</span>
    <strong>${name}</strong>
    <span class="staff-record-position">${position}</span>`;
  return card;
}

async function loadStaffDirectory() {
  try {
    const response = await fetch(`${GUEST_DIRECTORY_API}?action=list`, { redirect: 'follow' });
    const data = await response.json();
    if (!data.success || !Array.isArray(data.list) || data.list.length === 0) throw new Error('등록된 직원 기록이 없습니다.');

    guestGrid.innerHTML = '';
    data.list.forEach((staff, index) => guestGrid.append(buildCard(staff, index)));
  } catch (error) {
    guestGrid.innerHTML = `<p class="directory-error">${safeText(error.message || '직원 기록을 불러오지 못했습니다.')}</p>`;
  }
}

loadStaffDirectory();
