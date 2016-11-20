Git is an amazing tool for collaboration, but it has a steep learning curve. While most master the basic Git commands, many get insecure when things get just a tiny bit complicated. This tutorial will take you through the basic Git usage and present some typical use cases. I will provide a bit of theory, but the primary focus of this tutorial is to provide practical examples.

## Learn by doing

I have a set up a small project that we will use throughout this tutorial. Let's get our hands dirty - run the following commands:

```bash
# Create the example directory (you can create it wherever you want)
mkdir -p ~/Desktop/fit-with-git

# Navigate to the example directory
cd ~/Desktop/fit-with-git

# Create an index file
echo "<html><body><h1>Fit with Git</h1></body></html>" > index.html
```

## Installing Git

Install Git following the instructions [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). Once installed, verify that `git` is accessible on the command line. Run `git --help` to see the available commands.

## Initializing Git

You can now initialize Git in your project by running `git init` (you need to be in the example directory). This will create a `.git` folder in your project; dot files are hidden by default. Run `ls -la` to show hidden files in the directory.

## How Git works

Git works by taking snapshots of your project at different points in time. This is different from other version control systems that work by storing only file changes. A Git project consists of three different sections:

- Repository
- Working directory
- Staging area

The *repository* is the `.git` directory that we just created. It stores all the metadata and all the snapshots of your project. The *working directory* represents a single version of the project that you are currently working on. Lastly, the *staging area* holds the changed files that will be permanently stored in your repository after next commit. For further details dive into [this article](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics).

## Tracking and commiting

A good starting point for working in a git project is to run the `git status` command. Running this in our project we see that `index.html` is listed as being *untracked*. This means that the file is currently not under version control - to include it run `git add index.html`. Now running `git status` again we see that the files is listed under *changes to be committed*. Running `git commit -m "My first commit"` we now permanently store the `index.html` in our repository.

Now open up your editor and modify the `index.html` to the following:

```html
<!-- We are making the HTML a little prettier and adding a <p> tag -->
<html>
<body>
  <h1>Fit with Git</h1>
  <p>Work hard, Git hard!</p>
</body>
</html>
```

We have now modified the file. You can see the modifications to the file by running `git diff`, which outputs all deletions and insertions. Running `git add index.html` followed by `git commit -m "Added a paragraph of text"` permanently stores the modified file.

## Working with branches

Branches are common in the world of version control systems. Basically, a branch is a way for you to diverge from the main line of the project and work on another line separately. After working on another branch you merge the changes back into the main line, which in Git lingo is called the *master branch*. Let's say that we are to add some Javascript logic for toggling text to our `index.html`, but would like to do it on a new branch.

Firstly we run `git branch text-toggle` to create the new branch. To get a listing of available branches, run `git branch -v`. Using the `-v` flag we see the last commit made to each respective branch. Changing to our *text-toggle branch* is easy, just run `git checkout text-toggle`. Let's implement the feature on our branch:

```html
<!-- We have added some CSS, JS and a <button> element-->
<html>
<head>
  <style type="text/css">
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <h1>Fit with Git</h1>
  <p>Work hard, Git hard!</p>
  <button id="toggle-text">Toggle</button>

  <script>
    var btn = document.getElementById('toggle-text');
    btn.addEventListener('click', function(event) {
      var text = document.querySelector('p');
      text.classList.toggle('hidden');
    });
  </script>
</body>
</html>
```

Now add the changed file to staging and commit it in just one command `git commit -a -m "Added text-toggle feature"`. We are now ready to merge the *text-toggle branch* with our *master branch*. This is achieved with the commands `git checkout master` and `git merge text-toggle`. We are changing back to the *master branch* and merging it with the *text-toggle branch*. We finish off by deleting our *text-toggle branch* `git branch -d text-toggle`.

### Merge conflicts

Merging branches are not always as simple. Sometimes you have modified the same code in two different branches that you wish to merge. This results in a merge conflict. Imagine the following scenario - on two different branches, we have modified the text of the `<h1>` tag. Let's set it up.

```bash
# Create both branches (both off the master branch)
git branch feature-1
git branch feature-2

# Checkout the first branch and modify the <h1> in the index.html to say ´Git rocks´
git checkout feature-1
git commit -a -m "Changed text to git rocks"

# Checkout the second branch and modify the <h1> in the index.html to say ´Git sucks´
git checkout feature-2
git commit -a -m "Changed text to git sucks"

# Checkout the master branch and merge with the first branch
git checkout master
git merge feature-1

# Attempt to merge with the second branch
git merge feature-2
```

Doing this we encounter a merge conflict since Git doesn't know whether to choose *rocks* or *sucks* as the `<h1>` text. The error looks like this:

```plain
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

Going to the `index.html` we see that Git has made it easy for us:

```html
<<<<<<< HEAD
  <h1>Git rocks</h1>
=======
  <h1>Git sucks</h1>
>>>>>>> feature-2
```

Now we simply delete the `<h1>` saying *Git sucks* and clean up the file. We can then commit `git commit -a -m "Resolved <h1> text conflict"`.

### Rebasing

We looked at the  `git merge` command as a way to combine the work on two different branches. Another way of uniting the work of two branches is to use the `git rebase` command. Imagine a branch called *feature* that is one commit ahead of the master. While you have been working on *feature*, the master branch has been under development as well and has received a few commits. Using the `git rebase` command you can apply all the new changes to master directly on the *feature* branch. Internally Git finds the latest common commit between the two branches and then continually applies all changes. Follow me on this:

```bash
# Create and switch to the feature branch
git branch feature
git checkout feature

# Modify some files and commit the changes
git commit -a -m "Added an 'about us' text"

# Master has changed since we created the feature branch; we want those changes.
git rebase master

# Switch to master and merge the two branches (this is now easy, since 'feature' has been rebased with master)
git checkout master
git merge feature
```

## Stashing changes

Sometimes you find yourself in the situation of working on a certain issue, when something else requires your attention. In such a case, you can't just change branch, as your *dirty* working directory will follow you to the other branch. Ideally, you would like to temporarily revert all changes in your working directory and apply them again later. This can be achieved with the `git stash` command.

Now go to the `index.html` and make a modification. By running `git status`, we can see that `index.html` has been modified. To stash the changes simply run `git stash` followed by `git status` to see that your working directory is clean again. You can list all stashed changes with `git stash list`. The output will look something like this:

```plain
stash@{0}: WIP on test: 0232533 Resolved <h1> text conflict
```

Notice that the changes has an index of zero; you can store many changes at once and apply them using `git stash apply stash@{INDEX}`. Additionally the listing shows you the last commit before the changes were stashed. By running `git stash apply` Git applies the latest stash.

Stashing does by default only stash changes to already tracked files. This means that a new file will still be in your working directory. To stash both tracked and untracked files run the command `git stash -u`.

## Using Github

It is commonly believed that Git only works with [Github](https://github.com/). This is not true as Github only provides a web interface and cloud storage for your project - Git can be used entirely on its own on your machine as we have done throughout the tutorial. However because using Github is so widely used (and **awesome**) we need to add it to your developer tool belt! Without further ado let's create you an account on Github - click [here](https://github.com/) and come back when you are done.

Go to your profile and create a new repository. We will now link this repository to our local project so we can start pushing code to the cloud. The repository on Github will become the *remote* to our project. Firstly, let's try to list our current remote by running `git remote` - it doesn't print anything, since our project does not yet have a remote. Add the remote by running `git remote add origin https://github.com/lindekaer/fit-with-git.git` (use the link to your own repository). Now running `git remote --verbose` you see something like:

```plain
origin  https://github.com/lindekaer/fit-with-git.git (fetch)
origin  https://github.com/lindekaer/fit-with-git.git (push)
```

So what does this mean? The name *origin* is just a commonly used shortname. You can however use whatever name your prefer. You are able to both fetch (download data) and push (upload data) to the repository.

### Pushing and pulling

Let's push all our local data to the master branch on our remote `git push origin master`. It is annoying to constantly specify both *origin* and *master* when pushing to the remote. To make it easier, we can set the remote's master branch as our local master branch's *upstream* `git push --set-upstream origin master`. You can now just run `git push` in the future. Pulling data is just as easy, simply run `git pull` to get the newest data from the Github repository.

## Tips and tricks

I would like to share a few simple tips to make your Git life easier 🌟

### Git configuration

In order to tailor your Git setup to you, I recommend setting your `.gitconfig` (which you can find in your user directory). This is the global settings file. Here is an excerpt of mine:

```bash
[user]
  name = Theodor Lindekaer
  email = theodor.lindekaer@gmail.com
[core]
  editor = vim
[color]
  ui = true
```

### Aliases

I heavily use aliases to speed up my work. You will find yourself using the same commands over and over again, so aliases are a good investment - I promise.

```bash
# Add this to your .bash_profile (if using bash shell) or .zshrc (if using z-shell)
alias gs='git status'
alias gc='git commit -m'
alias gp='git push'
```

### Snippets
```bash
# Gives an excellent overview of the commit history
git log --oneline --decorate

# Equivalent to 'un-commit'
git reset HEAD^

# Delete a remote branch
git push origin --delete test

# Change the name of a branch
git branch -m [OLD_NAME] [NEW_NAME]

# Get all remote branches
git fetch --all

# Clear staging area and rewrite working tree from specified commit
# You can also write HEAD instead of [COMMIT], to reset to latest commit
git reset --hard [COMMIT]

# Change the message of your last commit
git commit --amend -m "New and correct message"
```
