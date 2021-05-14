import { GetStaticPaths, GetStaticProps } from 'next'
import React from 'react'
import PageLayout from '../../components/PageLayout'
import { MdxRemote } from 'next-mdx-remote/types'
import useHydrate from 'next-mdx-remote/hydrate'
import Counter from '../../components/Counter'
import renderMdxSource from '../../util/renderMdxSource'
import loadMarkdownFile from '../../util/loadMarkdownFile'
import getQueryParam from '../../util/getQueryParam'
import startCase from 'lodash/startCase'
import Link from 'next/link'
import loadAllPosts from '../../util/loadAllPosts'
import SourcegraphSearch from '../../components/SouregraphSearch'

const classForHeadingElements = 'mb-4 mt-5'
const markdownComponents = {
    img: createComponentWithClasses('img', 'my-5 w-100'),
    h1: createComponentWithClasses('h1', classForHeadingElements),
    h2: createComponentWithClasses('h2', classForHeadingElements),
    h3: createComponentWithClasses('h3', classForHeadingElements),
    h4: createComponentWithClasses('h4', classForHeadingElements),
    h5: createComponentWithClasses('h5', classForHeadingElements),
} as const

function createComponentWithClasses<T extends keyof JSX.IntrinsicElements>(tag: T, className: string) {
    return function (props: JSX.IntrinsicElements[T]) {
        return React.createElement(tag, { ...props, className: `${props.className ?? ''} ${className}` })
    }
}

const components = { Counter, SourcegraphSearch, ...markdownComponents }
interface Props {
    title: string
    author: string
    tags: string[]
    mdxSource: MdxRemote.Source
}

export default function Post(props: Props) {
    const content = useHydrate(props.mdxSource, { components })
    return (
        <PageLayout contentTitle={props.title}>
            <h1>{props.title}</h1>
            {props.author && <p className="text-muted">By {props.author}</p>}

            <div className="mb-5">
                {props.tags.map(tag => (
                    <Link key={tag} href={`/tags/${tag}`}>
                        <a className="me-1">
                            <span className="badge bg-primary">{startCase(tag)}</span>
                        </a>
                    </Link>
                ))}
            </div>

            <div className="markdown-content">{content}</div>
        </PageLayout>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await loadAllPosts(true)
    const paths = posts.map(post => ({ params: { slug: post.slug } }))
    return {
        paths,
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps<Props> = async context => {
    const slug = getQueryParam(context.params, 'slug')
    const baseDirectory = 'posts'
    const markdownFile = await loadMarkdownFile(baseDirectory, slug + '.md')
    const mdxSource = await renderMdxSource(markdownFile, components)

    return {
        props: {
            title: markdownFile.frontMatter.title ?? 'Untitled',
            author: markdownFile.frontMatter.author ?? '',
            tags: markdownFile.frontMatter.tags,
            mdxSource,
        },
    }
}
