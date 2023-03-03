const { context, getOctokit } = require('@actions/github')

async function getCommits() {
  const { owner, repo } = context.repo
  const { data: commits } = await getOctokit().rest.repos.listCommits({
    owner,
    repo,
    per_page: 100
  })
  return commits
}

async function main(){
  const commits = await getCommits()
  const labels = commits.map(commit => commit.commit.message.match(/(?<=\[).+?(?=\])/g))
  console.log(labels)
}

main()