const { context, getOctokit } = require('@actions/github')

function getCredentials(){
  const { owner, repo, private } = context.repo

  const prNumber = context.payload.head_commit.message.match(/#(\d+)/)[1] || null

  const token = process.env.GITHUB_TOKEN

  return { owner, repo, token, prNumber, private }
}

function formatCommit(commits){
  const commitsFormated = commits.map(item => {
    return {
      avatar: item.author.avatar_url,
      urlAuthor: item.author.html_url,
      author: item.author.login,
      message: item.commit.message,
      urlcommit: item.html_url,
      dateTime: item.commit.author.date,
    }
  }).sort((a, b) => {
    return new Date(b.dateTime) - new Date(a.dateTime)
  })

  return commitsFormated
}

async function getCommits() {
  const { owner, repo, token, prNumber } = getCredentials()

  try {
    const { data: commits } = await getOctokit(token).rest.pulls.listCommits({
      owner,
      repo,
      pull_number: prNumber,
    })

    return formatCommit(commits)
  } catch (err){
    console.log(err)
  }
}

async function formatFiles(files) {
  const filesFormated = files.map(item => {
    return {
      filename: item.filename,
      status: item.status,
      additions: item.additions,
      deletions: item.deletions,
      changes: item.changes,
      patch: item.patch,
      url: item.blob_url
    }
  })

  return filesFormated
}

async function getFiles() {
  const { owner, repo, token, prNumber } = getCredentials()

  try {
    const { data: files } = await getOctokit(token).rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    })

    return formatFiles(files)
  } catch (err){
    console.log(err)
  }
}

function createCommentMarkdown(commits, files){
    let markdown = `## Commits\n\n`

    markdown += `| Avatar | Author | Message | Commit | Date |\n`

    markdown += `| --- | --- | --- | --- | --- |\n`

    markdown += commits.map(item => {
      return `| <img src="${item.avatar}" width="50" height="50" /> | [${item.author}](item.urlAuthor) | ${item.message} | [Show more](${item.urlcommit}) | ${item.dateTime} |`
    }).join('\n')

    markdown += `\n---\n`

    markdown += `\n## Files\n`

    markdown += `| Filename | Status | Additions | Deletions | Changes | URL |\n`

    markdown += `| --- | --- | --- | --- | --- | --- |\n`

    markdown += files.map(item => {
      return `| ${item.filename} | ${item.status} | ${item.additions} | ${item.deletions} | ${item.changes} | [Show archive](${item.url}) |`
    }).join('\n')

  return markdown
}

async function createComment(commit, files, prNumber){
  const { owner, repo, token } = getCredentials()
  const commentMarkdown = createCommentMarkdown(commit, files)

  try {
    await getOctokit(token).rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: commentMarkdown,
    })

  } catch (err){
    console.log(err)
  }
}

async function main(){
  console.log(context.payload)

  const { prNumber, private } = getCredentials()

  if(!prNumber || private) return console.log('PR number not found')

  const commits = await getCommits()
  const files = await getFiles()

  await createComment(commits, files, prNumber)
}

main()