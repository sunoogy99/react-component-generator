---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 언어별 템플릿(kr/en)으로 PR 본문을 작성하고 GitHub Pull Request를 생성한다. "PR 만들어줘", "PR 생성", "create a PR", "open a pull request" 같은 요청에 활성화한다. 사용자가 "영어로", "한국말로" 처럼 언어를 지정하면 그 언어의 템플릿을 쓴다.
context: fork
allowed-tools: Read Glob Grep Bash
---

# Create PR

현재 브랜치의 변경사항을 분석해 PR 본문을 작성하고 `gh`로 Pull Request를 생성한다.

## 절차

### 1. 상태 확인

다음을 실행해 PR 대상을 파악한다.

- `git branch --show-current`: 현재 브랜치
- `git status --short`: 커밋되지 않은 변경 확인
- `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`: base 브랜치 (보통 `main`)
- `git log --oneline <base>..HEAD`: PR에 포함될 커밋
- `git diff <base>...HEAD --stat` 및 필요한 파일의 `git diff <base>...HEAD -- <파일>`: 변경 내용

중단 조건 (사유를 알리고 종료한다):

- 현재 브랜치가 base 브랜치와 같다. 브랜치를 새로 만들 것을 안내한다.
- `<base>..HEAD`에 커밋이 없다.
- 커밋되지 않은 변경이 있다. 먼저 커밋할 것을 안내한다 (이 스킬은 커밋하지 않는다).
- `gh auth status`가 실패한다.
- 같은 브랜치의 열린 PR이 이미 있다 (`gh pr view --json url,state`). 기존 PR URL을 알린다.

### 2. 템플릿 언어 결정

아래 우선순위로 정한다.

1. **명시적 요청**: 사용자가 언어를 지정하면 그것을 따른다.
   - "영어", "영문", "English", "in English" 등 → `en`
   - "한국어", "한국말", "국문", "Korean", "in Korean" 등 → `kr`
2. **입력 언어 감지**: 지정이 없으면 사용자가 이 요청을 입력한 언어를 따른다. 한글이 포함되면 `kr`, 그렇지 않고 영어면 `en`.
3. **기본값**: 판단이 어려우면 `kr`.

결정한 뒤 해당 템플릿을 Read로 읽는다.

- `kr` → `references/kr/pr-template.md`
- `en` → `references/en/pr-template.md`

템플릿 경로는 이 SKILL.md가 있는 디렉토리 기준이다.

### 3. PR 제목과 본문 작성

제목:

- 커밋이 하나면 그 커밋 메시지를 따른다.
- 여러 개면 변경 전체를 대표하는 한 줄로 쓴다. 70자 이내.
- 언어는 선택한 템플릿 언어와 같게 한다.
- 이 저장소의 커밋 관례(`feat`/`fix`/`refactor`/`chore: 요약`)가 있으면 prefix를 따른다.

본문:

- 템플릿의 섹션 구조와 순서를 그대로 유지한다. 섹션을 임의로 삭제하거나 추가하지 않는다.
- 각 섹션은 실제 diff와 커밋 로그에서 확인한 내용으로 채운다. 확인하지 못한 내용은 지어내지 않는다.
- 테스트 결과 등 실행하지 않은 검증은 체크하지 않는다.
- 해당 없는 섹션은 `해당 없음` / `N/A`로 남긴다.
- 본문 맨 끝에 시스템 또는 사용자 지침으로 요구되는 attribution 줄이 있으면 붙인다.

### 4. 푸시와 PR 생성

사용자가 PR 생성을 요청했으므로 승인 없이 진행한다.

1. 원격에 브랜치가 없거나 앞서 있으면 `git push -u origin <브랜치>`로 푸시한다. `--force`는 쓰지 않는다.
2. 본문은 heredoc으로 전달한다.

```bash
gh pr create --base <base> --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
```

- 사용자가 draft를 요청하면 `--draft`를 붙인다.
- 리뷰어, 라벨 등을 사용자가 지정했으면 `--reviewer`, `--label`로 반영한다.

### 5. 결과 보고

생성된 PR의 URL, 제목, 사용한 템플릿 언어를 알린다. 실패하면 원인을 그대로 전달하고, 임의의 우회(강제 푸시, base 변경 등)는 하지 않는다.

## 금지

- 커밋 생성, `--amend`, `reset`, `--force` 푸시는 하지 않는다.
- base 브랜치에 직접 푸시하지 않는다.
- 사용자의 언어 지정을 무시하고 입력 언어로 덮어쓰지 않는다.
- 템플릿 파일을 수정하지 않는다.
