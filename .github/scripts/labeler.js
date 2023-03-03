const { context, getOctokit } = require('@actions/github')
const { Octokit } = require('@octokit/core')

async function getCommits() {
  const { owner, repo } = context.repo
  
  const token = process.env.GITHUB_TOKEN

  console.log(`owner: ${owner}`)
  console.log(`repo: ${repo}`)
  console.log(`token: ${token}`)

  // const prNumber = process.env.PR_NUMBER ?? 11

  // try {
  //   const { data: commits } = await getOctokit(token).rest.pulls({
  //     owner: owner,
  //     repo: repo,
  //     pull_number: prNumber,
  //     per_page: 100
  //   })
  
  //   return commits
  // } catch (err){
  //   console.log(err)
  // }
}

async function main(){
  const commits = await getCommits()

  // console.log(commits)
}

main()