'use client'
import {
  useGetAllOrganizationsQuery,
  useUpdateOrganizationMutation,
} from '@repo/codegen/src/schema'
import { Input, InputRow } from '@repo/ui/input'
import { Panel, PanelHeader } from '@repo/ui/panel'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from '@repo/ui/form'
import { z } from 'zod'
import { Button } from '@repo/ui/button'
import { useEffect, useState } from 'react'
import { RESET_SUCCESS_STATE_MS } from '@/constants'

const OrganizationNameForm = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [{ fetching: isSubmitting }, updateOrg] =
    useUpdateOrganizationMutation()
  const { data: sessionData } = useSession()
  const currentOrgId = sessionData?.user.organization
  const [allOrgs] = useGetAllOrganizationsQuery({ pause: !sessionData })
  const currentOrganization = allOrgs.data?.organizations.edges?.filter(
    (org) => org?.node?.id === currentOrgId,
  )[0]?.node

  const formSchema = z.object({
    displayName: z.string().min(2, {
      message: 'Display name must be at least 2 characters',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
    },
  })

  useEffect(() => {
    if (currentOrganization) {
      form.reset({
        displayName: currentOrganization.displayName,
      })
    }
  }, [currentOrganization, form])

  const updateOrganization = async ({ displayName }: { displayName: string }) => {
    await updateOrg({
      updateOrganizationId: currentOrgId,
      input: {
        displayName: displayName,
      },
    })
    setIsSuccess(true)
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateOrganization({ displayName: data.displayName })
  }

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false)
      }, RESET_SUCCESS_STATE_MS)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  return (
    <Panel>
      <PanelHeader
        heading="Organization name"
        subheading="This is the name of your organization, which will hold your data and other configuration. This would typically be the name of the company you work for or represent."
        noBorder
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <InputRow>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input variant="medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant={isSuccess ? 'success' : 'aquamarine'}
              type="submit"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Saving' : isSuccess ? 'Saved' : 'Save'}
            </Button>
          </InputRow>
        </form>
      </Form>
    </Panel>
  )
}

export { OrganizationNameForm }
