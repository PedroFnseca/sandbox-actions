const { context, getOctokit } = require('@actions/github')

function getCredentials(){
  const { owner, repo } = context.repo

  const { private } = context.payload.repository
  const prNumber = context.payload.head_commit.message.match(/#(\d+)/)[1] || null
  const urlRepo = context.payload.repository.html_url

  const token = process.env.GITHUB_TOKEN

  return { owner, repo, token, prNumber, private, urlRepo }
}

function formatCommit(commits, private){
  const { urlRepo } = getCredentials()

  const commitsFormated = commits.map(item => {
    if(!private) {
      return {
        avatar: item.author.avatar_url ,
        urlAuthor: item.author.html_url,
        author: item.author.login,
        message: item.commit.message,
        urlcommit: item.html_url,
        dateTime: item.commit.author.date,
      }
    } else {
      return {
        avatar: `${urlRepo}/.github.scripts/avatar.webp`,
        urlAuthor: `https://github.com/${item.author.username}`,
        author: item.author.username,
        message: item.message,
        urlcommit: item.url,
        dateTime: item.timestamp,
      }
    }
  }).sort((a, b) => {
    return new Date(b.dateTime) - new Date(a.dateTime)
  })

  return commitsFormated
}

async function getCommits(private) {
  const { owner, repo, token, prNumber } = getCredentials()

  try {
    if(private) {
      const { commits } = context.payload

       return formatCommit(commits, private)
    } else {
      const { data: commits } = await getOctokit(token).rest.pulls.listCommits({
        owner,
        repo,
        pull_number: prNumber,
      })
  
      return formatCommit(commits, private)
    }
  } catch (err){
    console.error(err)
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

async function getFiles(private) {
  const { owner, repo, token, prNumber } = getCredentials()

  if(private) return []

  try {
    const { data: files } = await getOctokit(token).rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    })

    return formatFiles(files)
  } catch (err){
    console.error(err)
  }
}

function createCommentMarkdown(commits, files, private){
    let markdown = `## Commits\n\n`

    markdown += `| Avatar | Author | Message | Commit | Date |\n`

    markdown += `| --- | --- | --- | --- | --- |\n`

    markdown += commits.map(item => {
      return `| <img src="${item.avatar}" width="50" height="50" /> | [${item.author}](item.urlAuthor) | ${item.message} | [Show more](${item.urlcommit}) | ${item.dateTime} |`
    }).join('\n')

    if(private) return markdown

    markdown += `\n---\n`

    markdown += `\n## Files\n`

    markdown += `| Filename | Status | Additions | Deletions | Changes | URL |\n`

    markdown += `| --- | --- | --- | --- | --- | --- |\n`

    markdown += files.map(item => {
      return `| ${item.filename} | ${item.status} | ${item.additions} | ${item.deletions} | ${item.changes} | [Show archive](${item.url}) |`
    }).join('\n')

  return markdown
}

async function createComment(commits, files, prNumber, private){
  const { owner, repo, token } = getCredentials()
  const commentMarkdown = createCommentMarkdown(commits, files, private)

  try {
    await getOctokit(token).rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: commentMarkdown,
    })

    console.log('Comment created!')

  } catch (err){
    console.error(err)
  }
}

async function main(){
  console.time('time')
  console.log('Starting...')

  const { prNumber, private } = getCredentials()

  if(!prNumber) console.warn('Is not possible get the PR number')
  if(private) console.warn('Is not possible get the files from a private repository')

  const commits = await getCommits(private)
  const files = await getFiles(private)

  await createComment(commits, files, prNumber, private)

  console.log('Finished')
  console.timeEnd('time')
}

main()