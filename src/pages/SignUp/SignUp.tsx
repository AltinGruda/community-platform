import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { observer } from 'mobx-react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { string, object, ref, bool } from 'yup'
import { FRIENDLY_MESSAGES } from 'oa-shared'
import { Card, Flex, Heading, Text, Label } from 'theme-ui'
import { Button, ExternalLink, FieldInput } from 'oa-components'

import {
  composeValidators,
  noSpecialCharacters,
  required,
} from 'src/utils/validators'
import { formatLowerNoSpecial } from 'src/utils/helpers'
import { PasswordField } from 'src/common/Form/PasswordField'
import { useCommonStores } from 'src/index'

const validationSchema = object({
  displayName: string().min(2, 'Too short').required('Required'),
  email: string().email('Invalid email').required('Required'),
  password: string().required('Password is required'),
  'confirm-password': string()
    .oneOf([ref('password'), ''], 'Your new password does not match')
    .required('Password confirm is required'),
  consent: bool().oneOf([true], 'Consent is required'),
})

interface IFormValues {
  email: string
  password: string
  passwordConfirmation: string
  displayName: string
  consent: boolean
}
interface IState {
  formValues: IFormValues
  errorMsg?: string
  disabled?: boolean
}

const SignUpPage = observer(() => {
  const navigate = useNavigate()
  const { userStore } = useCommonStores().stores
  const [state, setState] = useState<IState>({
    formValues: {
      email: '',
      password: '',
      passwordConfirmation: '',
      displayName: '',
      consent: false,
    },
  })

  const checkUserNameUnique = async (userName: string) => {
    const user = await userStore!.getUserProfile(userName)
    return user && !user._deleted ? false : true
  }

  const onSignupSubmit = async (v: IFormValues) => {
    const { email, password, displayName } = v
    const userName = formatLowerNoSpecial(displayName as string)

    try {
      if (await checkUserNameUnique(userName)) {
        await userStore!.registerNewUser(email, password, displayName)
        navigate('/sign-up-message')
      } else {
        setState((prev) => ({
          ...prev,
          errorMsg: FRIENDLY_MESSAGES['sign-up username taken'],
          disabled: false,
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errorMsg: error.message,
        disabled: false,
      }))
    }
  }

  if (userStore!.user) {
    return <Navigate to={'/'} />
  }

  return (
    <Form
      onSubmit={(v) => onSignupSubmit(v as IFormValues)}
      validate={async (values: any) => {
        try {
          await validationSchema.validate(values, { abortEarly: false })
        } catch (err) {
          return err.inner.reduce(
            (acc: any, error) => ({
              ...acc,
              [error.path]: error.message,
            }),
            {},
          )
        }
      }}
      render={({ submitting, invalid, handleSubmit }) => {
        const disabled = invalid || submitting
        return (
          <form onSubmit={handleSubmit}>
            <Flex
              bg="inherit"
              px={2}
              sx={{ width: '100%' }}
              css={{ maxWidth: '620px' }}
              mx={'auto'}
              mt={20}
              mb={3}
            >
              <Flex sx={{ flexDirection: 'column', width: '100%' }}>
                <Card bg={'softblue'}>
                  <Flex px={3} py={2} sx={{ width: '100%' }}>
                    <Heading>Hey, nice to see you here</Heading>
                  </Flex>
                </Card>
                <Card mt={3}>
                  <Flex
                    px={4}
                    pt={0}
                    pb={4}
                    sx={{
                      flexWrap: 'wrap',
                      flexDirection: 'column',
                      width: '100%',
                    }}
                  >
                    <Heading variant="small" py={4} sx={{ width: '100%' }}>
                      Create an account
                    </Heading>
                    <Flex
                      mb={3}
                      sx={{
                        width: ['100%', '100%', `${(2 / 3) * 100}%`],
                        flexDirection: 'column',
                      }}
                    >
                      <Label htmlFor="displayName">
                        Username. Think carefully. You can't change this*
                      </Label>
                      <Field
                        data-cy="username"
                        name="displayName"
                        type="userName"
                        component={FieldInput}
                        placeholder="Pick a unique name"
                        validate={composeValidators(
                          required,
                          noSpecialCharacters,
                        )}
                      />
                    </Flex>
                    <Flex
                      mb={3}
                      sx={{
                        flexDirection: 'column',
                        width: ['100%', '100%', `${(2 / 3) * 100}%`],
                      }}
                    >
                      <Label htmlFor="email">
                        Email, personal or workspace*
                      </Label>
                      <Field
                        data-cy="email"
                        name="email"
                        type="email"
                        component={FieldInput}
                        placeholder="hey@jack.com"
                        validate={required}
                      />
                    </Flex>
                    <Flex
                      mb={3}
                      sx={{
                        flexDirection: 'column',
                        width: ['100%', '100%', `${(2 / 3) * 100}%`],
                      }}
                    >
                      <Label htmlFor="password">Password*</Label>
                      <PasswordField
                        data-cy="password"
                        name="password"
                        component={FieldInput}
                        validate={required}
                      />
                    </Flex>
                    <Flex
                      mb={3}
                      sx={{
                        flexDirection: 'column',
                        width: ['100%', '100%', `${(2 / 3) * 100}%`],
                      }}
                    >
                      <Label htmlFor="confirm-password">
                        Confirm Password*
                      </Label>
                      <PasswordField
                        data-cy="confirm-password"
                        name="confirm-password"
                        component={FieldInput}
                        validate={required}
                      />
                    </Flex>
                    <Flex
                      mb={3}
                      mt={2}
                      sx={{ width: ['100%', '100%', `${(2 / 3) * 100}%`] }}
                    >
                      <Label>
                        <Field
                          data-cy="consent"
                          name="consent"
                          type="checkbox"
                          component="input"
                          validate={required}
                        />
                        <Text
                          sx={{
                            fontSize: 2,
                          }}
                        >
                          I agree to the{' '}
                          <ExternalLink href="/terms">
                            Terms of Service
                          </ExternalLink>
                          <span> and </span>
                          <ExternalLink href="/privacy">
                            Privacy Policy
                          </ExternalLink>
                        </Text>
                      </Label>
                    </Flex>
                    <Text color={'red'} data-cy="error-msg">
                      {state.errorMsg}
                    </Text>
                    <Flex mb={3} sx={{ justifyContent: 'space-between' }}>
                      <Text color={'grey'} mt={2} sx={{ fontSize: 1 }}>
                        Already have an account ?
                        <Link to="/sign-in"> Sign-in here</Link>
                      </Text>
                    </Flex>

                    <Flex>
                      <Button
                        large
                        data-cy="submit"
                        sx={{ width: '100%', justifyContent: 'center' }}
                        variant={'primary'}
                        disabled={disabled}
                        type="submit"
                      >
                        Create account
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              </Flex>
            </Flex>
          </form>
        )
      }}
    />
  )
})

export default SignUpPage
