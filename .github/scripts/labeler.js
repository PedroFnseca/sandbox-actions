const { context, getOctokit } = require('@actions/github')

async function getCommits() {
  const { owner, repo } = context.repo
  
  const token = process.env.GITHUB_TOKEN
  const prNumber = process.env.PR_NUMBER ?? 11

  try {
    const { data: commits } = await getOctokit(token).rest.pulls.listCommits({
      owner,
      repo,
      pull_number: prNumber,
    })
  
    return commits
  } catch (err){
    console.log(err)
  }
}

async function main(){
  const commits = await getCommits()

  // console.log(commits)
}

main()