import {TextInput} from './TextInput.js'
import {CommandToken, TokenizedText} from './TokenizedText.js'
import {TextAnimation} from './TextAnimation.js'
import {handleCtrlC} from '../../ui.js'
import useLayout from '../hooks/use-layout.js'
import React, {FunctionComponent, useState} from 'react'
import {Box, useInput, Text, useStdout, useApp} from 'ink'
import {exec} from '@shopify/cli-kit/node/system'

export interface AiPromptProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chain: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainParams: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retriever: any
}

const loadingBarChar = '▀'

const AiPrompt: FunctionComponent<AiPromptProps> = ({chain, chainParams, retriever}) => {
  const {oneThird} = useLayout()
  const [error, setError] = useState<string | undefined>(undefined)
  const underline = new Array(oneThird - 3).fill('▔')
  const [answer, setAnswer] = useState('')
  const [question, setQuestion] = useState('What would you like to do?')
  const [aiAnswer, setAiAnswer] = useState<CommandToken>()
  const [loading, setLoading] = useState(false)
  const {exit: unmountInk} = useApp()

  const callChain = async () => {
    const relevantDocs = await retriever.getRelevantDocuments(answer)

    setLoading(true)
    const response = await chain.call({
      ...chainParams,
      input_documents: relevantDocs,
      user_prompt: answer,
    })
    setLoading(false)

    return response
  }

  useInput((input, key) => {
    handleCtrlC(input, key)

    if (key.ctrl && input === 'r' && aiAnswer && aiAnswer.command) {
      unmountInk()
      exec('pnpm', aiAnswer.command.split(' ')).catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error)
      })
    }

    if (key.return && answer) {
      callChain()
        .then((response) => {
          setAiAnswer({command: response.output.command})
          if (response.output.clarifying_question.length > 0) {
            setQuestion(response.output.clarifying_question)
          } else {
            setAnswer('')
          }
        })
        .catch((error) => {
          setError(error)
        })
    }
  })

  const {stdout} = useStdout()

  const loadingBar = new Array(oneThird).fill(loadingBarChar).join('')

  return (
    <Box width={stdout.columns} height={stdout.rows} flexDirection="column">
      <Box flexGrow={1} />
      <Box flexDirection="column" width={oneThird}>
        {aiAnswer ? (
          <Box marginBottom={3} flexDirection="column">
            <Text>Would you like me to run this command?</Text>
            <TokenizedText item={aiAnswer} />
            <Text>Press Shift + Enter if so</Text>
          </Box>
        ) : null}
        {loading ? <TextAnimation text={loadingBar} /> : null}
        <Box>
          <Box marginRight={2}>
            <Text>?</Text>
          </Box>
          <TokenizedText item={question} />
        </Box>

        <Box flexDirection="column">
          <Box>
            <Box marginRight={2}>
              <Text color="cyan">{`>`}</Text>
            </Box>
            <Box flexGrow={1}>
              <TextInput
                value={answer}
                onChange={(answer) => {
                  setAnswer(answer)
                }}
              />
            </Box>
          </Box>
          <Box marginLeft={3}>
            <Text color="cyan">{underline}</Text>
          </Box>
          {error ? (
            <Box marginLeft={3}>
              <Text color="red">{error}</Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

export {AiPrompt}
