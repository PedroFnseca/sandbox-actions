const { context, getOctokit } = require('@actions/github')

function getCredentials(){
  const { owner, repo } = context.repo
  const token = process.env.GITHUB_TOKEN
  const prNumber = process.env.PR_NUMBER

  return { owner, repo, token, prNumber }
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

function createCommentMarkdown(commits, prNumber){
    let markdown = `## Commits: ${prNumber}\n\n`

    markdown += `| Avatar | Author | Message | Commit | Date |\n`

    markdown += `| --- | --- | --- | --- | --- |\n`

    markdown += commits.map(item => {
      return `| <img src="${item.avatar}" width="50" height="50" /> | [${item.author}](item.urlAuthor) | ${item.message} | [Show more](${item.urlcommit}) | ${item.dateTime} |`
    }).join('\n')

  return markdown
}

async function createComment(commit){
  const { owner, repo, token, prNumber } = getCredentials()
  const commentMarkdown = createCommentMarkdown(commit, prNumber)

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
  const commits = await getCommits()
  await createComment(commits)
}

main()