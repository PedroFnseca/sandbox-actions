const { context, getOctokit } = require('@actions/github')

const ocotkit = getOctokit(process.env.GITHUB_TOKEN)

async function getCommits() {
  const { data } = await ocotkit.repos.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    sha: context.sha,
    per_page: 100,
  })
  return data
}

async function main(){
  const commits = await getCommits()
  const labels = commits.map(commit => commit.commit.message).join(' ').match(/(?<=\[).+?(?=\])/g)
  console.log(labels)
}

main()